package com.google.blockly.android.webview;

import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.WebView;

/**
 * Provides native hooks for JavaScript console dialog functions.
 */
public class WebChromeClient extends android.webkit.WebChromeClient {
    @Override
    public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
        new JsDialogHelper(result, JsDialogHelper.ALERT, null, message, url)
                .showDialog(view.getContext());
        return true;
    }

    @Override
    public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
        new JsDialogHelper(result, JsDialogHelper.CONFIRM, null, message, url)
                .showDialog(view.getContext());
        return true;
    }

    @Override
    public boolean onJsPrompt(WebView view, String url, String message, String defaultValue,
            JsPromptResult result) {
        new JsDialogHelper(result, JsDialogHelper.PROMPT, defaultValue, message, url)
                .showDialog(view.getContext());
        return true;
    }
}
