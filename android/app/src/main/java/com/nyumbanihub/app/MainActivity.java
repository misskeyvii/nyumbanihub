package com.nyumbanihub.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null || intent.getData() == null) return;
        Uri data = intent.getData();
        String url = data.toString();

        // If it's our OAuth callback, load it in the WebView
        if (url.contains("nyumbanihab.vercel.app/auth/callback") || 
            url.contains("mabidha.vercel.app/auth/callback") ||
            url.startsWith("com.nyumbanihub.app")) {
            getBridge().getWebView().post(() -> 
                getBridge().getWebView().loadUrl(url)
            );
        }
    }
}
