const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const SwitchBotAPI = require('./src/switchbot-api');

class SwitchBotMonitor {
  constructor() {
    this.tray = null;
    this.api = null;
    this.devices = [];
    this.deviceStatuses = {};
    this.updateInterval = null;
    this.selectedDeviceId = null;
    this.temperatureDevices = [];
  }

  createTray() {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    const icon = nativeImage.createFromPath(iconPath);
    icon.setTemplateImage(true);
    
    this.tray = new Tray(icon.resize({ width: 16, height: 16 }));
    this.tray.setToolTip('SwitchBot Monitor');
    this.updateTrayTitle('🌡️ --°C --% 💧');
    
    this.buildContextMenu();
  }

  updateTrayTitle(title) {
    if (this.tray) {
      this.tray.setTitle(title);
    }
  }

  buildContextMenu() {
    const menuItems = [
      {
        label: 'SwitchBot Monitor',
        enabled: false
      },
      { type: 'separator' },
      {
        label: this.api ? 'Refresh Data' : 'Setup API Credentials',
        click: () => {
          if (this.api) {
            this.refreshData();
          } else {
            this.showSetupWindow();
          }
        }
      },
      {
        label: 'Launch at Login',
        type: 'checkbox',
        checked: app.getLoginItemSettings().openAtLogin,
        click: (menuItem) => {
          app.setLoginItemSettings({
            openAtLogin: menuItem.checked
          });
        }
      }
    ];

    // Add temperature device selection submenu if there are multiple temperature devices
    if (this.temperatureDevices.length > 1) {
      menuItems.push({
        label: 'Select Temperature Device',
        submenu: this.temperatureDevices.map(device => ({
          label: device.deviceName + (this.selectedDeviceId === device.deviceId ? ' ✓' : ''),
          type: 'radio',
          checked: this.selectedDeviceId === device.deviceId,
          click: () => {
            this.selectedDeviceId = device.deviceId;
            this.saveSelectedDevice();
            this.updateDisplay();
            this.buildContextMenu();
          }
        }))
      });
    }

    menuItems.push(...this.buildDeviceMenuItems());
    menuItems.push({ type: 'separator' });
    menuItems.push({
      label: 'Quit',
      click: () => {
        app.quit();
      }
    });

    const contextMenu = Menu.buildFromTemplate(menuItems);
    this.tray.setContextMenu(contextMenu);
  }

  buildDeviceMenuItems() {
    if (!this.devices.length) return [];

    const items = [{ type: 'separator' }];
    
    this.devices.forEach(device => {
      const status = this.deviceStatuses[device.deviceId];
      let statusText = device.deviceName;
      
      if (status) {
        const details = [];
        if (status.temperature !== undefined) {
          details.push(`Temperature: ${status.temperature}°C`);
        }
        if (status.humidity !== undefined) {
          details.push(`Humidity: ${status.humidity}%`);
        }
        if (status.battery !== undefined) {
          details.push(`Battery: ${status.battery}%`);
        }
        
        if (details.length > 0) {
          statusText += `\n${details.join('\n')}`;
        }
      }

      items.push({
        label: statusText,
        enabled: false
      });
    });

    return items;
  }

  async refreshData() {
    if (!this.api) return;

    try {
      const devices = await this.api.getDevices();
      this.devices = devices;

      // Filter temperature devices (devices that can provide temperature data)
      this.temperatureDevices = devices.filter(device => 
        device.deviceType === 'Meter' || 
        device.deviceType === 'MeterPlus' || 
        device.deviceType === 'Hub Mini' ||
        device.deviceType === 'Indoor Cam' ||
        device.deviceType.toLowerCase().includes('meter') ||
        device.deviceType.toLowerCase().includes('thermo')
      );

      // Auto-select first temperature device if none selected
      if (this.temperatureDevices.length > 0 && !this.selectedDeviceId) {
        this.selectedDeviceId = this.temperatureDevices[0].deviceId;
        this.saveSelectedDevice();
      }

      for (const device of this.devices) {
        try {
          const status = await this.api.getDeviceStatus(device.deviceId);
          this.deviceStatuses[device.deviceId] = status;
        } catch (error) {
          console.error(`Error fetching status for device ${device.deviceId}:`, error);
        }
      }

      this.updateDisplay();
      this.buildContextMenu();
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }

  updateDisplay() {
    let tempText = '--°C';
    let humidityText = '--%';

    // Use selected device if available, otherwise use any device with temperature data
    if (this.selectedDeviceId && this.deviceStatuses[this.selectedDeviceId]) {
      const status = this.deviceStatuses[this.selectedDeviceId];
      if (status.temperature !== undefined) {
        tempText = `${status.temperature}°C`;
      }
      if (status.humidity !== undefined) {
        humidityText = `${status.humidity}%`;
      }
    } else {
      // Fallback to any device with temperature data
      for (const status of Object.values(this.deviceStatuses)) {
        if (status.temperature !== undefined) {
          tempText = `${status.temperature}°C`;
        }
        if (status.humidity !== undefined) {
          humidityText = `${status.humidity}%`;
        }
        break;
      }
    }

    this.updateTrayTitle(`🌡️ ${tempText} ${humidityText} 💧`);
  }

  showSetupWindow() {
    const setupWindow = new BrowserWindow({
      width: 500,
      height: 400,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      title: 'SwitchBot API Setup',
      resizable: false,
      minimizable: false,
      maximizable: false
    });

    setupWindow.loadFile('src/setup.html');

    setupWindow.webContents.on('did-finish-load', () => {
      setupWindow.webContents.executeJavaScript(`
        const { ipcRenderer } = require('electron');
        
        document.getElementById('saveButton').addEventListener('click', () => {
          const token = document.getElementById('token').value.trim();
          const secret = document.getElementById('secret').value.trim();
          
          if (token && secret) {
            ipcRenderer.send('save-credentials', { token, secret });
          } else {
            alert('Please enter both token and secret key.');
          }
        });
      `);
    });

    const { ipcMain } = require('electron');
    ipcMain.once('save-credentials', (event, credentials) => {
      this.api = new SwitchBotAPI(credentials.token, credentials.secret);
      this.loadSelectedDevice();
      setupWindow.close();
      this.startPeriodicRefresh();
      this.refreshData();
    });
  }

  startPeriodicRefresh() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(() => {
      this.refreshData();
    }, 5 * 60 * 1000); // 5 minutes
  }

  saveSelectedDevice() {
    const fs = require('fs');
    const configPath = path.join(__dirname, '.config.json');
    
    try {
      let config = {};
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
      config.selectedDeviceId = this.selectedDeviceId;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Error saving selected device:', error);
    }
  }

  loadSelectedDevice() {
    const fs = require('fs');
    const configPath = path.join(__dirname, '.config.json');
    
    try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.selectedDeviceId = config.selectedDeviceId;
      }
    } catch (error) {
      console.error('Error loading selected device:', error);
    }
  }

  init() {
    app.whenReady().then(() => {
      this.createTray();
      this.loadSelectedDevice();
      
      app.on('window-all-closed', (e) => {
        e.preventDefault();
      });

      app.dock?.hide();
    });

    app.on('before-quit', () => {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
    });
  }
}

const monitor = new SwitchBotMonitor();
monitor.init();