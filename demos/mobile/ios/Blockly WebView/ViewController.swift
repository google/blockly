//
//  ViewController.swift
//  Blockly WebView
//
//  Created by Andrew Marshall on 8/7/18.
//  Copyright © 2018 Google. All rights reserved.
//

import UIKit
import WebKit

class ViewController: UIViewController {
    /// The name used to reference this iOS object when executing callbacks from the JS code.
    /// If this value is changed, it should also be changed in the `CODE_GENERATOR_BRIDGE_JS` file.
    fileprivate static let HOST_HTML = "Blockly/webview.html"
    
    @IBOutlet weak var webView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        loadWebView()
    }
    
    func loadWebView() {
        if let htmlUrl = Bundle.main.url(forResource: "webview", withExtension: "html", subdirectory: "Blockly") {
            webView.load(URLRequest.init(url: htmlUrl))
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

