package com.google.blockly.android.webview;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;

/**
 * This fragments contains and manages the web view that hosts Blockly.
 */
public class BlocklyWebViewFragment extends Fragment {
    protected @Nullable WebView mWebView = null;

    @SuppressLint("SetJavaScriptEnabled")
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
            @Nullable Bundle savedInstanceState) {
        mWebView = new WebView(inflater.getContext());
        mWebView.setWebChromeClient(new WebChromeClient());
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        mWebView.loadUrl("file:///android_asset/blockly/webview.html");
        return mWebView;
    }

    // TODO: Method to invoke code generation
    // TODO: Method to load workspace from string (or InputStream?)
    // TODO: Method to serialize workspace to string (or OutputStream?)
    // TODO: Clear / reset workspace
    // TODO: Load toolbox
    // TODO: Listener for event JSON
    // TODO: Method to evaluate JavaScript string in the WebView
}
