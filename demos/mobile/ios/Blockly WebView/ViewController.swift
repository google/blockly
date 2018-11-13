//
//  ViewController.swift
//  Blockly WebView
//
//  Created by Andrew Marshall on 8/7/18.
//  Copyright © 2018 Google. All rights reserved.
//

import UIKit
import WebKit

class ViewController: UIViewController, WKUIDelegate {
    /// The name used to reference this iOS object when executing callbacks from the JS code.
    /// If this value is changed, it should also be changed in the `CODE_GENERATOR_BRIDGE_JS` file.
    fileprivate static let HOST_HTML = "Blockly/webview.html"
    
    @IBOutlet weak var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        webView.uiDelegate = self
        // Do any additional setup after loading the view, typically from a nib.
        loadWebContent()
    }
    
    func loadWebContent() {
        if let htmlUrl = Bundle.main.url(forResource: "webview", withExtension: "html", subdirectory: "Blockly") {
            webView.load(URLRequest.init(url: htmlUrl))
        }
    }

    func webView(_ webView: WKWebView,
                 runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping () -> Void) {
        
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        let title = NSLocalizedString("OK", comment: "OK Button")
        let ok = UIAlertAction(title: title, style: .default) { (action: UIAlertAction) -> Void in
            alert.dismiss(animated: true, completion: nil)
        }
        alert.addAction(ok)
        present(alert, animated: true)
        completionHandler()
    }
    
    func webView(_ webView: WKWebView,
                 runJavaScriptConfirmPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (Bool) -> Void) {
        
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        let closeAndHandle = { (okayed: Bool) in
            alert.dismiss(animated: true, completion: nil)
            completionHandler(okayed)
        }
        
        let okTitle = NSLocalizedString("OK", comment: "OK button title")
        let ok = UIAlertAction(title: okTitle, style: .default) { (action: UIAlertAction) -> Void in
            closeAndHandle(true)
        }
        alert.addAction(ok)
        
        let cancelTitle = NSLocalizedString("Cancel", comment: "Cancel button title")
        let cancel = UIAlertAction(title: cancelTitle, style: .default) { (action: UIAlertAction) -> Void in
            closeAndHandle(false)
        }
        alert.addAction(cancel)
        present(alert, animated: true)
    }
    
    func webView(_ webView: WKWebView,
                 runJavaScriptTextInputPanelWithPrompt prompt: String,
                 defaultText: String?,
                 initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (String?) -> Void) {
        
        let alert = UIAlertController(title: prompt, message: nil, preferredStyle: .alert)
        
        alert.addTextField { (textField) in
            textField.text = defaultText
        }
        
        let okTitle = NSLocalizedString("OK", comment: "OK button title")
        let okAction = UIAlertAction(title: okTitle, style: .default) { (_) in
            let textInput = alert.textFields![0] as UITextField
            completionHandler(textInput.text)
        }
        alert.addAction(okAction)
        
        let cancelTitle = NSLocalizedString("Cancel", comment: "Cancel button title")
        let cancelAction = UIAlertAction(title: cancelTitle, style: .cancel) { (_) in
            completionHandler(nil)
        }
        alert.addAction(cancelAction)
        
        present(alert, animated: true)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
}

