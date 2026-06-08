#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"), 
    windows_subsystem = "windows"
)]

use tauri::{AppHandle, WebviewWindowBuilder, WebviewUrl};
use tauri::Manager;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowConfigData {
    pub label: String,
    pub title: String,
    pub width: f64,
    pub height: f64,
    pub x: f64,      
    pub y: f64,
    pub resizable: bool,
    pub maximizable: bool,
    pub route: Option<String>,
    pub maximize: bool,
}

#[tauri::command]
async fn create_window(app: AppHandle, config: WindowConfigData) -> Result<(), String> {
    if app.get_window(&config.label).is_some() {
        return Err(format!("窗口 {} 已存在", config.label));
    }

    let url = WebviewUrl::App(
        match &config.route {
            Some(route) => format!("/index.html#{}", route),
            None => "/index.html".to_string()
        }.into()
    );

    let window = WebviewWindowBuilder::new(&app, &config.label, url)
        .title(config.title)
        .inner_size(config.width, config.height)
        .resizable(config.resizable)
        .maximizable(config.maximizable)
        .position(config.x, config.y)
        .build()
        .map_err(|e| format!("窗口创建失败: {}", e))?;

    if config.maximize {
        window.maximize().map_err(|e| format!("最大化失败: {}", e))?;
    }
    window.show().map_err(|e| format!("显示窗口失败: {}", e))?;
    Ok(())
}

#[tauri::command]
fn close_window(window: tauri::Window) -> Result<(), String> {

    window.close().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
 fn set_window_size(window: tauri::Window, width: u32, height: u32) -> Result<(), String> {
    window.set_size(tauri::Size::Logical(tauri::LogicalSize { 
        width: width.into(), 
        height: height.into() 
    }))
    .map_err(|e| e.to_string())
}

#[tauri::command]
 fn set_window_resizable(window: tauri::Window, resizable: bool) -> Result<(), String> {
    window.set_resizable(resizable).map_err(|e| e.to_string())
}

#[tauri::command]
 fn set_window_maximizable(window: tauri::Window, maximizable: bool) -> Result<(), String> {
    window.set_maximizable(maximizable).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_window_size,
            set_window_resizable,
            set_window_maximizable,
            create_window,
            close_window,
        ])
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}