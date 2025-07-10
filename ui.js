// ComfyUI 菜单扩展
import { app } from '../../scripts/app.js';

class MenuExtension {
    constructor() {
        this.config = null;
        this.basePath = '';
    }

    async loadConfig() {
        try {
            this.basePath = './extensions/ComfyUI-CustomMenu';
            
            const scripts = document.getElementsByTagName('script');
            for (let script of scripts) {
                if (script.src && script.src.includes('ComfyUI-CustomMenu')) {
                    const url = new URL(script.src);
                    this.basePath = url.pathname.replace('/ui.js', '');
                    break;
                }
            }
            
            const response = await fetch(`${this.basePath}/config.json`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const text = await response.text();
            this.config = JSON.parse(text);
        } catch (error) {
            console.error('[MenuExtension] Config load failed:', error);
            this.config = {
                "extensionName": "aigc_06_MenuConfigurable",
                "commands": [
                    {
                        "id": "homePageLink",
                        "label": "作 者 主 页",
                        "action": {
                            "type": "open_url",
                            "value": "https://aix.ink"
                        }
                    },
                    {
                        "id": "qrcodeLink",
                        "label": "豪 华 礼 包",
                        "action": {
                            "type": "show_qrcode",
                            "value": {
                                "image": "qr_code.png",
                                "title": "微信扫码联系编程界的小学生",
                                "description": "微信: aigc_06  欢迎少年~"
                            }
                        }
                    }
                ],
                "menuStructure": [
                    {
                        "path": ["编程界的小学生（vx：aigc_06）"],
                        "commands": ["homePageLink", "qrcodeLink"]
                    }
                ],
                "iconMapping": {
                    "编程界的小学生（vx：aigc_06）": "1.png",
                    "作 者 主 页": "1.png",
                    "豪 华 礼 包": "qr_code.png"
                },
                "menuOrder": {
                    "topLevelMenuLabel": "编程界的小学生（vx：aigc_06）",
                    "position": "prepend"
                }
            };
            this.basePath = './extensions/ComfyUI-CustomMenu';
        }
    }

    async initialize() {
        await this.loadConfig();
        
        return {
            name: this.config.extensionName || 'MenuExtension',
            commands: this.generateCommands(),
            menuCommands: this.generateMenuStructure(),
            init: () => this.initUI()
        };
    }

    generateCommands() {
        return this.config.commands.map(cmd => ({
            id: cmd.id,
            label: cmd.label,
            function: () => this.executeAction(cmd.action)
        }));
    }

    generateMenuStructure() {
        return this.config.menuStructure.map(menu => ({
            path: menu.path,
            commands: menu.commands
        }));
    }

    executeAction(action) {
        switch (action.type) {
            case 'open_url':
                window.open(action.value, '_blank');
                break;
            case 'show_qrcode':
                this.showQRModal(action.value);
                break;
            case 'alert':
                alert(action.value);
                break;
        }
    }

    showQRModal(config) {
        const existing = document.getElementById('qr-modal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'qr-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 99999;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white; padding: 30px; border-radius: 10px;
            text-align: center; max-width: 400px;
        `;
        
        const title = document.createElement('h3');
        title.textContent = config.title || '二维码';
        
        const img = document.createElement('img');
        img.src = `${this.basePath}/icons/${config.image}`;
        img.style.cssText = 'max-width: 250px; max-height: 250px;';
        
        const desc = document.createElement('p');
        desc.textContent = config.description || '';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.onclick = () => modal.remove();
        closeBtn.style.cssText = 'margin-top: 15px; padding: 8px 16px;';
        
        content.append(title, img, desc, closeBtn);
        modal.appendChild(content);
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        document.body.appendChild(modal);
    }

    initUI() {
        this.processMenu();
        setTimeout(() => this.processMenu(), 500);
        setTimeout(() => this.processMenu(), 1500);
        
        setInterval(() => this.processMenu(), 5000);
        
        const observer = new MutationObserver(() => {
            setTimeout(() => this.processMenu(), 200);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    processMenu() {
        const menuList = document.querySelector('.p-menubar-root-list');
        if (!menuList) return;
        
        this.moveMenuToFront();
        this.addIcons();
        this.applyStyling();
    }

    moveMenuToFront() {
        if (!this.config.menuOrder || this.config.menuOrder.position !== 'prepend') return;
        
        const menuList = document.querySelector('.p-menubar-root-list');
        if (!menuList) return;
        
        const targetLabel = this.config.menuOrder.topLevelMenuLabel;
        const menuItems = menuList.querySelectorAll('li.p-menubar-item');
        
        for (const item of menuItems) {
            const label = item.querySelector('.p-menubar-item-label');
            if (label && label.textContent.trim() === targetLabel) {
                if (menuList.firstElementChild !== item) {
                    menuList.insertBefore(item, menuList.firstElementChild);
                }
                break;
            }
        }
    }

    addIcons() {
        if (!this.config.iconMapping) return;
        
        Object.entries(this.config.iconMapping).forEach(([label, iconFile]) => {
            const labels = document.querySelectorAll('.p-menubar-item-label');
            
            for (const labelEl of labels) {
                if (labelEl.textContent.trim() === label) {
                    const link = labelEl.closest('.p-menubar-item-link');
                    if (link && !link.querySelector('.menu-icon')) {
                        const icon = document.createElement('img');
                        icon.className = 'menu-icon';
                        icon.src = `${this.basePath}/icons/${iconFile}`;
                        
                        // 应用图标尺寸配置
                        const styling = this.config.menuStyling?.[label];
                        const iconWidth = styling?.iconWidth || '18px';
                        const iconHeight = styling?.iconHeight || '18px';
                        
                        icon.style.cssText = `width: ${iconWidth}; height: ${iconHeight}; margin-right: 6px; vertical-align: middle;`;
                        
                        link.insertBefore(icon, labelEl);
                    }
                }
            }
        });
    }

    applyStyling() {
        if (!this.config.menuStyling) return;
        
        Object.entries(this.config.menuStyling).forEach(([label, styling]) => {
            const labels = document.querySelectorAll('.p-menubar-item-label');
            
            for (const labelEl of labels) {
                if (labelEl.textContent.trim() === label) {
                    const link = labelEl.closest('.p-menubar-item-link');
                    const menuItem = labelEl.closest('.p-menubar-item');
                    
                    if (link && menuItem) {
                        // 应用颜色
                        if (styling.color) {
                            labelEl.style.color = styling.color;
                        }
                        
                        // 应用宽度
                        if (styling.width) {
                            menuItem.style.minWidth = styling.width;
                            link.style.minWidth = styling.width;
                        }
                        
                        // 应用高度
                        if (styling.height) {
                            menuItem.style.height = styling.height;
                            link.style.height = styling.height;
                            link.style.minHeight = styling.height;
                        }
                        
                        // 应用字体大小
                        if (styling.fontSize) {
                            labelEl.style.fontSize = styling.fontSize;
                        }
                        
                        // 应用字体粗细
                        if (styling.fontWeight) {
                            labelEl.style.fontWeight = styling.fontWeight;
                        }
                        
                        // 应用内边距
                        if (styling.padding) {
                            link.style.padding = styling.padding;
                        }
                        
                        // 确保flex布局
                        link.style.display = 'flex';
                        link.style.alignItems = 'center';
                    }
                }
            }
        });
    }
}

// 初始化扩展
const menuExt = new MenuExtension();
menuExt.initialize().then(config => {
    app.registerExtension(config);
    menuExt.initUI();
}).catch(error => {
    console.error('[MenuExtension] Init failed:', error);
});