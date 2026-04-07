import { invoke } from '@tauri-apps/api/core';
import type { WindowConfigData } from '../types/auth';

/**
 * 初始化窗口配置
 * @param config - 窗口配置数据
 */
export function initWindowConfig(config: WindowConfigData): void {
  // 设置窗口大小
  invoke('set_window_size', { width: config.width, height: config.height })
    .catch(err => console.error('设置窗口大小失败:', err));

  // 设置窗口是否可最大化
  if (config.maximizable !== undefined) {
    invoke('set_window_maximizable', { maximizable: config.maximizable })
      .catch(err => console.error('设置窗口最大化属性失败:', err));
  }

  // 设置窗口是否可调整大小
  if (config.resizable !== undefined) {
    invoke('set_window_resizable', { resizable: config.resizable })
      .catch(err => console.error('设置窗口可调整大小属性失败:', err));
  }
}