# SwitchBot Monitor

<p align="center">
  <img src="assets/icon.png" alt="SwitchBot Monitor" width="64" height="64">
</p>

<p align="center">
  <strong>SwitchBot devices monitoring on your macOS menubar</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS-lightgrey.svg" alt="Platform">
  <img src="https://img.shields.io/badge/electron-v36.4.0-blue.svg" alt="Electron">
  <img src="https://img.shields.io/github/license/MASAKASUNO1/switchbot-monitor.svg" alt="License">
</p>

Monitor your SwitchBot devices directly from your macOS menubar with real-time temperature and humidity display.

## ✨ Features

- 🌡️ **Real-time Display** - Temperature and humidity in menubar
- 📱 **Device Management** - View all your SwitchBot devices
- 🔄 **Auto Refresh** - Updates every 5 minutes automatically  
- 🚀 **Launch at Login** - Start automatically with macOS
- 🔧 **Easy Setup** - Simple API credential configuration
- 🎯 **Multi-Device Support** - Select from multiple temperature sensors

## 📥 Download

Download the latest version from the [Releases](https://github.com/MASAKASUNO1/switchbot-monitor/releases) page:

- **macOS Intel**: `SwitchBot Monitor-1.0.0.dmg` 
- **macOS Apple Silicon**: `SwitchBot Monitor-1.0.0.dmg` (Universal build)

## 🚀 Quick Start

### Option 1: Download Pre-built App
1. Download the DMG file from releases
2. Install the app to Applications folder
3. Launch SwitchBot Monitor
4. Enter your SwitchBot API credentials

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/MASAKASUNO1/switchbot-monitor.git
cd switchbot-monitor

# Install dependencies
npm install

# Run the app
npm start

# Build for distribution
npm run build
```

## 🔐 API Setup

To use this app, you need SwitchBot API credentials:

1. Open SwitchBot mobile app
2. Tap **Profile** (bottom right)
3. Tap **Settings**
4. Tap **App Version** 10 times
5. **Developer Options** will appear
6. Tap **Get Token**

Enter the **Token** and **Secret** in the setup window.

## 🎯 Usage

- Temperature and humidity appear in menubar: `🌡️ 23.5°C 60% 💧`
- Right-click to view all devices and settings
- Select specific temperature device if you have multiple
- Enable "Launch at Login" to start automatically

## 🛠 Technology Stack

- **Electron** - Cross-platform desktop app framework
- **SwitchBot API v1.1** - Official API with HMAC-SHA256 authentication
- **Node.js** - JavaScript runtime
- **Axios** - HTTP client for API requests

## 📁 Project Structure

```
switchbot-monitor/
├── main.js              # Main process (menubar app)
├── src/
│   ├── switchbot-api.js  # SwitchBot API wrapper
│   └── setup.html        # API credentials setup UI
├── assets/
│   └── icon.png          # Menubar icon
└── package.json          # Dependencies and build config
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SwitchBot](https://www.switchbot.jp/) for providing the API
- [Electron](https://www.electronjs.org/) for the desktop app framework

---

<p align="center">
  Made with ❤️ for SwitchBot users
</p>