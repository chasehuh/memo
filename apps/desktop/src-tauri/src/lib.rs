#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            use tauri::Manager;
            use tauri::window::Color;

            if let Some(window) = app.get_webview_window("main") {
                // Opaque NSWindow/webview fill under Overlay traffic lights.
                let _ = window.set_background_color(Some(Color(0x14, 0x14, 0x14, 0xff)));
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running agentnote");
}
