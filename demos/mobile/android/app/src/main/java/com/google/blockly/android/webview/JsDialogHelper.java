/**
 * Copyright (C) 2013 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.google.blockly.android.webview;

import android.app.Activity;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Message;
import android.support.annotation.Nullable;
import android.support.v7.app.AlertDialog;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.WebView;
import android.widget.EditText;
import android.widget.TextView;

import com.example.blocklywebview.R;

/**
 * Helper class to create JavaScript dialogs.
 * Adapted from android-9.0.0_r10/core/java/android/webkit/JsDialogHelper.java.
 * Removes dialog title (page domain) and uses a larger prompt message area than original.
 */
public class JsDialogHelper {
    private static final String TAG = "JsDialogHelper";
    // Dialog types
    /** An alert dialog, for console.alert(..). */
    public static final int ALERT   = 1;
    /** An alert dialog, for console.confirm(..). */
    public static final int CONFIRM = 2;
    /** An alert dialog, for console.prompt(..). */
    public static final int PROMPT  = 3;

    private final @Nullable String mDefaultValue;
    private final JsResult mResult;
    private final String mMessage;
    private final int mType;
    private final String mUrl;

    public JsDialogHelper(JsResult result, int type, @Nullable String defaultValue,
            String message, String url) {
        if (type == PROMPT && !(result instanceof JsPromptResult)) {
            throw new IllegalArgumentException("JsDialogHelper PROMPT requires JsPromptResult");
        }
        mResult = result;
        mDefaultValue = defaultValue;
        mMessage = message;
        mType = type;
        mUrl = url;
    }

    public JsDialogHelper(JsResult result, Message msg) {
        mResult = result;
        mDefaultValue = msg.getData().getString("default");
        mMessage = msg.getData().getString("message");
        mType = msg.getData().getInt("type");
        mUrl = msg.getData().getString("url");
    }

    public boolean invokeCallback(WebChromeClient client, WebView webView) {
        switch (mType) {
            case ALERT:
                return client.onJsAlert(webView, mUrl, mMessage, mResult);
            case CONFIRM:
                return client.onJsConfirm(webView, mUrl, mMessage, mResult);
            case PROMPT:
                return client.onJsPrompt(webView, mUrl, mMessage, mDefaultValue, (JsPromptResult) mResult);
            default:
                throw new IllegalArgumentException("Unexpected type: " + mType);
        }
    }

    public void showDialog(Context context) {
        if (!canShowAlertDialog(context)) {
            Log.w(TAG, "Cannot create a dialog, the WebView context is not an Activity");
            mResult.cancel();
            return;
        }
        final EditText edit;
        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setOnCancelListener(new CancelListener());
        if (mType != PROMPT) {
            edit = null;
            builder.setMessage(mMessage);
            builder.setPositiveButton(android.R.string.ok, new PositiveListener(null));
        } else {
            final View view = LayoutInflater.from(context).inflate(R.layout.js_prompt, null);
            edit = view.findViewById(R.id.js_prompt_value);
            edit.setText(mDefaultValue);
            builder.setPositiveButton(android.R.string.ok, new PositiveListener(edit));
            ((TextView) view.findViewById(R.id.js_prompt_message)).setText(mMessage);
            builder.setView(view);

            // TODO: Open keyboard and place text cursor.
        }
        if (mType != ALERT) {
            builder.setNegativeButton(android.R.string.cancel, new CancelListener());
        }
        final AlertDialog dialog = builder.show();
    }

    private class CancelListener implements DialogInterface.OnCancelListener,
            DialogInterface.OnClickListener {
        @Override
        public void onCancel(DialogInterface dialog) {
            mResult.cancel();
        }
        @Override
        public void onClick(DialogInterface dialog, int which) {
            mResult.cancel();
        }
    }

    private class PositiveListener implements DialogInterface.OnClickListener {
        private final EditText mEdit;
        public PositiveListener(EditText edit) {
            mEdit = edit;
        }
        @Override
        public void onClick(DialogInterface dialog, int which) {
            if (mEdit == null) {
                mResult.confirm();
            } else {
                ((JsPromptResult) mResult).confirm(mEdit.getText().toString());
            }
        }
    }

    private static boolean canShowAlertDialog(Context context) {
        return context instanceof Activity;
    }
}
