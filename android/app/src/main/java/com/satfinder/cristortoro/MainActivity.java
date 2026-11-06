package com.satfinder.cristortoro;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AliSocketPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
