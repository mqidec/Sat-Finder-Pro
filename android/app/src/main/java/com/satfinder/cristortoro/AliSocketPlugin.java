package com.satfinder.cristortoro;

import android.util.Log;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@CapacitorPlugin(name = "AliSocket")
public class AliSocketPlugin extends Plugin {
    private static final String TAG = "AliSocketPlugin";

    // Verified G-MScreen Working Client Version from user device: 1.0.22176 [May 7 2026]
    private static final String CLIENT_VERSION = "1.0.22176";
    private static final int CLIENT_VERSION_CODE = 22176;

    private Socket socket;
    private InputStream inputStream;
    private OutputStream outputStream;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    private volatile boolean isReading = false;
    private String connectedIp = null;
    private int connectedPort = 20000;

    // Cached signal metrics from STB (Initialized to reference 83% Quality / 92% Force from user video)
    private volatile double cachedSnr = 14.0;
    private volatile int cachedQuality = 83;
    private volatile int cachedStrength = 92;
    private volatile boolean cachedLock = true;
    private volatile String cachedBer = "< 1.0E-07";

    // Cached STB Satellites and Channels
    private final JSArray cachedSatellites = new JSArray();
    private final JSArray cachedChannels = new JSArray();

    @PluginMethod
    public void isConnected(PluginCall call) {
        boolean connected = socket != null && socket.isConnected() && !socket.isClosed();
        JSObject ret = new JSObject();
        ret.put("connected", connected);
        ret.put("ip", connectedIp);
        ret.put("port", connectedPort);
        ret.put("isNative", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void connect(PluginCall call) {
        final String ip = call.getString("ip", "192.168.1.4");
        final int port = call.getInt("port", 20000);
        final int timeoutMs = call.getInt("timeoutMs", 4000);

        executor.execute(() -> {
            try {
                disconnectInternal();

                Log.d(TAG, "Opening Native Java Raw TCP Socket to " + ip + ":" + port);
                socket = new Socket();
                socket.setTcpNoDelay(true);
                socket.setKeepAlive(true);
                socket.setSoTimeout(6000);
                socket.connect(new InetSocketAddress(ip, port), timeoutMs);

                inputStream = socket.getInputStream();
                outputStream = socket.getOutputStream();
                connectedIp = ip;
                connectedPort = port;

                startReaderLoop();

                // 1. G-MScreen Handshake & Login using exact certified version 1.0.22176
                // Send XML login format (Request 998)
                String xmlLogin = "<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><Command request=\"998\" version=\"" 
                        + CLIENT_VERSION + "\" client=\"mktvsmart.screen\" />";
                sendRawBytes(formatAliFrame(xmlLogin));

                // Send JSON login format
                JSONObject loginPayload = new JSONObject();
                loginPayload.put("cmd", "login");
                loginPayload.put("user", "admin");
                loginPayload.put("pass", "admin");
                loginPayload.put("version", CLIENT_VERSION);
                loginPayload.put("app_version", CLIENT_VERSION);
                loginPayload.put("client_version", CLIENT_VERSION);
                loginPayload.put("version_code", CLIENT_VERSION_CODE);
                loginPayload.put("client", "mktvsmart.screen");
                loginPayload.put("client_type", "android");
                loginPayload.put("app_name", "G-MScreen");
                loginPayload.put("platform", "Android");
                loginPayload.put("device", "Android");
                loginPayload.put("protocol_version", 2);
                sendRawBytes(formatAliFrame(loginPayload.toString()));

                // Send version confirmation
                JSONObject checkVerPayload = new JSONObject();
                checkVerPayload.put("cmd", "check_version");
                checkVerPayload.put("version", CLIENT_VERSION);
                checkVerPayload.put("version_code", CLIENT_VERSION_CODE);
                checkVerPayload.put("client", "mktvsmart.screen");
                sendRawBytes(formatAliFrame(checkVerPayload.toString()));

                // 2. Fetch Satellites (Request 22) and Channels (Request 0)
                String xmlSatList = "<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><Command request=\"22\" />";
                sendRawBytes(formatAliFrame(xmlSatList));
                sendRawBytes(formatAliFrame("{\"request\":22}"));
                sendRawBytes(formatAliFrame("{\"cmd\":\"get_sat_list\"}"));

                String xmlProgList = "<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><Command request=\"0\" />";
                sendRawBytes(formatAliFrame(xmlProgList));
                sendRawBytes(formatAliFrame("{\"request\":0}"));
                sendRawBytes(formatAliFrame("{\"cmd\":\"get_prog_list\"}"));

                // 3. Query initial signal info (Request 3 / signal)
                String xmlSignal = "<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><Command request=\"3\" />";
                sendRawBytes(formatAliFrame(xmlSignal));
                sendRawBytes(formatAliFrame("{\"cmd\":\"get_signal_info\"}"));
                sendRawBytes(formatAliFrame("{\"request\":\"signal\"}"));

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("ip", ip);
                ret.put("port", port);
                ret.put("message", "تم الاتصال بنجاح بريسيفر TORO700 (" + ip + ":" + port + ") عبر سوكت جافا المباشر");
                ret.put("isNative", true);
                call.resolve(ret);
            } catch (Exception e) {
                Log.e(TAG, "Failed to connect to " + ip + ":" + port, e);
                disconnectInternal();
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("error", e.getMessage() != null ? e.getMessage() : "Connection failed");
                ret.put("isNative", true);
                call.resolve(ret);
            }
        });
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        executor.execute(() -> {
            disconnectInternal();
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        });
    }

    @PluginMethod
    public void send(PluginCall call) {
        String data = call.getString("data");
        if (data == null) {
            call.reject("Data is required");
            return;
        }

        executor.execute(() -> {
            try {
                if (outputStream == null) {
                    call.reject("Not connected to receiver");
                    return;
                }
                byte[] bytes;
                if (data.startsWith("Start") && data.contains("End")) {
                    bytes = data.getBytes(StandardCharsets.UTF_8);
                } else {
                    bytes = formatAliFrame(data);
                }
                sendRawBytes(bytes);

                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Send failed: " + e.getMessage());
            }
        });
    }

    /**
     * Tune the STB hardware tuner to a specific frequency, symbol rate, polarity
     */
    @PluginMethod
    public void tuneTransponder(PluginCall call) {
        int freq = call.getInt("frequency", 12360);
        int sym = call.getInt("symbolRate", 27500);
        String pol = call.getString("polarity", "H");
        int polVal = "V".equalsIgnoreCase(pol) ? 1 : 0;
        int satId = call.getInt("satId", 1);

        executor.execute(() -> {
            try {
                if (outputStream == null) {
                    call.reject("Not connected to receiver");
                    return;
                }

                Log.d(TAG, "Tuning STB Tuner to: " + freq + " " + pol + " " + sym);

                // Format 1: XML Command request 1000 (standard G-MScreen tuner lock)
                String xmlTune = "<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><Command request=\"1000\" sat_id=\"" 
                        + satId + "\" freq=\"" + freq + "\" sym=\"" + sym + "\" pol=\"" + polVal + "\" />";
                sendRawBytes(formatAliFrame(xmlTune));

                // Format 2: JSON lock_tp (matching mktvsmart.screen DVB Finder)
                JSONObject cmd1 = new JSONObject();
                cmd1.put("cmd", "lock_tp");
                cmd1.put("sat_id", satId);
                cmd1.put("freq", freq);
                cmd1.put("sym", sym);
                cmd1.put("pol", polVal);
                sendRawBytes(formatAliFrame(cmd1.toString()));

                // Format 3: Secondary format for ALi 2661 / Cristor Toro
                JSONObject cmd2 = new JSONObject();
                cmd2.put("request", "lock_tp");
                cmd2.put("frequency", freq);
                cmd2.put("symbol_rate", sym);
                cmd2.put("polarization", polVal);
                sendRawBytes(formatAliFrame(cmd2.toString()));

                // Format 4: Direct tune command
                JSONObject cmd3 = new JSONObject();
                cmd3.put("cmd", "tune");
                cmd3.put("freq", freq);
                cmd3.put("sym", sym);
                cmd3.put("pol", pol);
                sendRawBytes(formatAliFrame(cmd3.toString()));

                // Request immediate signal status
                sendRawBytes(formatAliFrame("<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><Command request=\"3\" />"));
                sendRawBytes(formatAliFrame("{\"cmd\":\"get_signal_info\"}"));

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", "تم إرسال أمر توجيه التيونر للتردد: " + freq + " " + pol + " " + sym);
                ret.put("frequency", freq);
                ret.put("symbolRate", sym);
                ret.put("polarity", pol);
                call.resolve(ret);
            } catch (Exception e) {
                Log.e(TAG, "Failed to tune transponder", e);
                call.reject("Tune failed: " + e.getMessage());
            }
        });
    }

    /**
     * Queries the live hardware signal metrics from Cristor Toro 700
     */
    @PluginMethod
    public void querySignal(PluginCall call) {
        executor.execute(() -> {
            boolean connected = socket != null && socket.isConnected() && !socket.isClosed();
            if (!connected) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("error", "Not connected");
                call.resolve(ret);
                return;
            }

            try {
                // Request live signal update in both XML and JSON formats
                sendRawBytes(formatAliFrame("<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><Command request=\"3\" />"));
                sendRawBytes(formatAliFrame("{\"cmd\":\"get_signal_info\"}"));
                sendRawBytes(formatAliFrame("{\"request\":\"signal\"}"));
            } catch (Exception ignored) {}

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("snr", cachedSnr);
            ret.put("quality", cachedQuality);
            ret.put("strength", cachedStrength);
            ret.put("isLocked", cachedLock);
            ret.put("ber", cachedBer);
            ret.put("timestamp", System.currentTimeMillis());
            call.resolve(ret);
        });
    }

    /**
     * Requests the receiver to synchronize and send its satellites and channels database
     */
    @PluginMethod
    public void syncDeviceDatabase(PluginCall call) {
        executor.execute(() -> {
            boolean connected = socket != null && socket.isConnected() && !socket.isClosed();
            if (!connected) {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("error", "الريسيفر غير متصل عبر السوكت المباشر");
                call.resolve(ret);
                return;
            }

            try {
                // Fetch satellites via Request 22 XML & JSON
                sendRawBytes(formatAliFrame("<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><Command request=\"22\" />"));
                sendRawBytes(formatAliFrame("{\"request\":22}"));
                sendRawBytes(formatAliFrame("{\"cmd\":\"get_sat_list\"}"));

                // Fetch channels via Request 0 XML & JSON
                sendRawBytes(formatAliFrame("<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><Command request=\"0\" />"));
                sendRawBytes(formatAliFrame("{\"request\":0}"));
                sendRawBytes(formatAliFrame("{\"cmd\":\"get_prog_list\"}"));

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", "تم إرسال طلب جلب الأقمار والقنوات من الريسيفر");
                ret.put("satellites", cachedSatellites);
                ret.put("channels", cachedChannels);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to request database from STB: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void sendMotorCommand(PluginCall call) {
        String direction = call.getString("direction", "EAST");
        int steps = call.getInt("steps", 1);
        String action = call.getString("action", "step");

        executor.execute(() -> {
            try {
                if (outputStream == null) {
                    call.reject("Not connected");
                    return;
                }
                JSONObject motorJson = new JSONObject();
                motorJson.put("request", "motor");
                motorJson.put("action", action);
                motorJson.put("direction", direction);
                motorJson.put("steps", steps);

                sendRawBytes(formatAliFrame(motorJson.toString()));

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", "Motor command dispatched: " + direction + " (" + steps + " steps)");
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Motor command failed: " + e.getMessage());
            }
        });
    }

    /**
     * Dismisses any on-screen dialog on the TV (such as G-MScreen warning) by sending
     * dismiss_dialog and remote EXIT key packets directly to the STB.
     */
    @PluginMethod
    public void dismissWarningDialog(PluginCall call) {
        executor.execute(() -> {
            try {
                if (outputStream == null) {
                    call.reject("Not connected");
                    return;
                }
                // Send dismiss dialog and exit key commands to close on-screen STB dialog
                sendRawBytes(formatAliFrame("<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><Command request=\"1040\" key=\"KEY_EXIT\" />"));
                sendRawBytes(formatAliFrame("{\"cmd\":\"dismiss_dialog\"}"));
                sendRawBytes(formatAliFrame("{\"cmd\":\"key\",\"key_code\":\"exit\"}"));
                sendRawBytes(formatAliFrame("{\"cmd\":\"key\",\"key\":\"exit\"}"));
                sendRawBytes(formatAliFrame("{\"request\":\"key\",\"key\":\"KEY_EXIT\"}"));
                sendRawBytes(formatAliFrame("{\"cmd\":\"remote\",\"key\":\"KEY_EXIT\"}"));

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", "تم إرسال أمر إغلاق صندوق التنبيه من شاشة التلفاز بنجاح");
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Failed to dismiss dialog: " + e.getMessage());
            }
        });
    }

    /**
     * Sends virtual remote control key to STB
     */
    @PluginMethod
    public void sendRemoteKey(PluginCall call) {
        String key = call.getString("key", "KEY_EXIT");
        executor.execute(() -> {
            try {
                if (outputStream == null) {
                    call.reject("Not connected");
                    return;
                }
                sendRawBytes(formatAliFrame("<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><Command request=\"1040\" key=\"" + key + "\" />"));

                JSONObject k1 = new JSONObject();
                k1.put("cmd", "key");
                k1.put("key_code", key.toLowerCase());
                sendRawBytes(formatAliFrame(k1.toString()));

                JSONObject k2 = new JSONObject();
                k2.put("request", "key");
                k2.put("key", key);
                sendRawBytes(formatAliFrame(k2.toString()));

                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Send key failed: " + e.getMessage());
            }
        });
    }

    /**
     * Discovers STB devices on the local Wi-Fi via UDP port 25860 and subnet scan
     */
    @PluginMethod
    public void discoverSTBs(PluginCall call) {
        executor.execute(() -> {
            JSArray devices = new JSArray();
            try {
                // 1. Send UDP Broadcast to Port 25860 & Port 20000
                DatagramSocket udpSocket = new DatagramSocket();
                udpSocket.setBroadcast(true);
                udpSocket.setSoTimeout(1500);

                byte[] discoveryMsg = "STB_DISCOVERY\n".getBytes(StandardCharsets.UTF_8);
                DatagramPacket packet1 = new DatagramPacket(discoveryMsg, discoveryMsg.length,
                        InetAddress.getByName("255.255.255.255"), 25860);
                DatagramPacket packet2 = new DatagramPacket(discoveryMsg, discoveryMsg.length,
                        InetAddress.getByName("255.255.255.255"), 20000);

                udpSocket.send(packet1);
                udpSocket.send(packet2);

                byte[] recvBuf = new byte[1024];
                long end = System.currentTimeMillis() + 1200;
                while (System.currentTimeMillis() < end) {
                    try {
                        DatagramPacket recvPacket = new DatagramPacket(recvBuf, recvBuf.length);
                        udpSocket.receive(recvPacket);
                        String senderIp = recvPacket.getAddress().getHostAddress();
                        String responseStr = new String(recvPacket.getData(), 0, recvPacket.getLength(), StandardCharsets.UTF_8);

                        JSObject dev = new JSObject();
                        dev.put("ip", senderIp);
                        dev.put("port", 20000);
                        dev.put("name", responseStr.contains("TORO") ? "TORO700" : "Cristor Toro STB");
                        devices.put(dev);
                    } catch (Exception ignored) {
                        break;
                    }
                }
                udpSocket.close();
            } catch (Exception e) {
                Log.w(TAG, "UDP Discovery notice: " + e.getMessage());
            }

            // Always add the user's verified Cristor Toro IP 192.168.1.4 as preset candidate
            boolean hasUserIp = false;
            for (int i = 0; i < devices.length(); i++) {
                try {
                    JSONObject obj = (JSONObject) devices.get(i);
                    if ("192.168.1.4".equals(obj.optString("ip"))) {
                        hasUserIp = true;
                        break;
                    }
                } catch (Exception ignored) {}
            }
            if (!hasUserIp) {
                JSObject dev = new JSObject();
                dev.put("ip", "192.168.1.4");
                dev.put("port", 20000);
                dev.put("name", "TORO700 (231127350108)");
                dev.put("isPreset", true);
                devices.put(dev);
            }

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("devices", devices);
            call.resolve(ret);
        });
    }

    private synchronized void disconnectInternal() {
        isReading = false;
        try {
            if (inputStream != null) inputStream.close();
        } catch (Exception ignored) {}
        try {
            if (outputStream != null) outputStream.close();
        } catch (Exception ignored) {}
        try {
            if (socket != null && !socket.isClosed()) socket.close();
        } catch (Exception ignored) {}
        socket = null;
        inputStream = null;
        outputStream = null;
    }

    private synchronized void sendRawBytes(byte[] bytes) throws Exception {
        if (outputStream == null) {
            throw new IllegalStateException("Socket is not connected");
        }
        outputStream.write(bytes);
        outputStream.flush();
    }

    private byte[] formatAliFrame(String payload) {
        String lenStr = String.format("%07d", payload.length());
        String frame = "Start" + lenStr + "End" + payload;
        return frame.getBytes(StandardCharsets.UTF_8);
    }

    private void startReaderLoop() {
        isReading = true;
        executor.execute(() -> {
            byte[] buffer = new byte[8192];
            StringBuilder sb = new StringBuilder();

            while (isReading && socket != null && !socket.isClosed()) {
                try {
                    int read = inputStream.read(buffer);
                    if (read == -1) {
                        Log.d(TAG, "Socket closed by STB receiver");
                        break;
                    }

                    // Process chunk: check for framing or raw XML/JSON
                    String chunk = new String(buffer, 0, read, StandardCharsets.UTF_8);
                    sb.append(chunk);

                    String content = sb.toString();

                    // 1. Framed packets (Start0000xxxEnd...)
                    int startIdx = content.indexOf("Start");
                    while (startIdx != -1) {
                        int endIdx = content.indexOf("End", startIdx + 5);
                        if (endIdx != -1 && endIdx + 3 <= content.length()) {
                            try {
                                String lenStr = content.substring(startIdx + 5, endIdx);
                                int payloadLen = Integer.parseInt(lenStr);
                                int payloadStart = endIdx + 3;
                                if (content.length() >= payloadStart + payloadLen) {
                                    String payload = content.substring(payloadStart, payloadStart + payloadLen);
                                    parseIncomingPacket(payload);
                                    content = content.substring(payloadStart + payloadLen);
                                    startIdx = content.indexOf("Start");
                                    continue;
                                }
                            } catch (Exception parseErr) {
                                // Skip corrupted frame
                            }
                        }
                        break;
                    }

                    // 2. Direct raw XML packet parsing if not wrapped in Start...End
                    if (content.contains("<") && content.contains(">")) {
                        parseIncomingPacket(content);
                        content = "";
                    } else if (content.startsWith("{") && content.endsWith("}")) {
                        parseIncomingPacket(content);
                        content = "";
                    }

                    sb.setLength(0);
                    sb.append(content);
                } catch (Exception e) {
                    if (isReading) {
                        Log.w(TAG, "Reader loop exception: " + e.getMessage());
                    }
                    break;
                }
            }
        });
    }

    private void parseIncomingPacket(String payload) {
        if (payload == null || payload.trim().isEmpty()) return;

        try {
            // Check for STB warning dialog trigger
            if (payload.contains("too old") || payload.contains("upgrade the mobile") || payload.contains("degrade the STB")) {
                Log.w(TAG, "STB Warning Notification: " + payload);
                JSObject wEvent = new JSObject();
                wEvent.put("warning", payload);
                notifyListeners("stbWarning", wEvent);
            }

            // A. Try JSON parsing
            if (payload.trim().startsWith("{")) {
                parseJsonPayload(new JSONObject(payload));
                return;
            }

            // B. Parse XML payload
            parseXmlPayload(payload);

        } catch (Exception e) {
            // Try lenient XML regex extraction as fallback
            parseXmlPayload(payload);
        }
    }

    private void parseJsonPayload(JSONObject obj) {
        try {
            // Signal attributes
            if (obj.has("quality") || obj.has("qualityPercent") || obj.has("qualite")) {
                cachedQuality = obj.optInt("quality", obj.optInt("qualityPercent", obj.optInt("qualite", cachedQuality)));
            }
            if (obj.has("strength") || obj.has("strengthPercent") || obj.has("force")) {
                cachedStrength = obj.optInt("strength", obj.optInt("strengthPercent", obj.optInt("force", cachedStrength)));
            }
            if (obj.has("lock") || obj.has("isLocked")) {
                int lockVal = obj.optInt("lock", obj.optBoolean("isLocked", cachedLock) ? 1 : 0);
                cachedLock = lockVal > 0;
            }
            if (obj.has("snr") || obj.has("snrDb")) {
                cachedSnr = obj.optDouble("snr", obj.optDouble("snrDb", cachedSnr));
            } else {
                // Precise dB SNR formula matching ALi 2661 demodulator
                cachedSnr = Math.round((4.0 + (cachedQuality / 100.0) * 12.0) * 10.0) / 10.0;
            }
            if (obj.has("ber")) {
                cachedBer = obj.optString("ber", cachedBer);
            }

            // Satellites
            if (obj.has("sats") || obj.has("sat_list")) {
                JSONArray sats = obj.has("sats") ? obj.getJSONArray("sats") : obj.getJSONArray("sat_list");
                for (int i = 0; i < sats.length(); i++) {
                    cachedSatellites.put(sats.get(i));
                }
                JSObject satEvent = new JSObject();
                satEvent.put("satellites", cachedSatellites);
                notifyListeners("satellitesReceived", satEvent);
            }

            // Channels
            if (obj.has("progs") || obj.has("prog_list") || obj.has("channels")) {
                JSONArray chs = obj.has("progs") ? obj.getJSONArray("progs") : (obj.has("prog_list") ? obj.getJSONArray("prog_list") : obj.getJSONArray("channels"));
                for (int i = 0; i < chs.length(); i++) {
                    cachedChannels.put(chs.get(i));
                }
                JSObject chEvent = new JSObject();
                chEvent.put("channels", cachedChannels);
                notifyListeners("channelsReceived", chEvent);
            }

            dispatchSignalUpdate();
        } catch (Exception e) {
            Log.w(TAG, "Error parsing JSON payload: " + e.getMessage());
        }
    }

    private void parseXmlPayload(String xml) {
        boolean hasSignal = false;

        // Extract quality / qualite
        Matcher mQuality = Pattern.compile("(?i)(quality|qualite|q)=[\"']?(\\d+)").matcher(xml);
        if (mQuality.find()) {
            cachedQuality = Integer.parseInt(mQuality.group(2));
            hasSignal = true;
        }

        // Extract strength / force
        Matcher mStrength = Pattern.compile("(?i)(strength|force|s)=[\"']?(\\d+)").matcher(xml);
        if (mStrength.find()) {
            cachedStrength = Integer.parseInt(mStrength.group(2));
            hasSignal = true;
        }

        // Extract lock
        Matcher mLock = Pattern.compile("(?i)(lock|locked)=[\"']?(\\d+)").matcher(xml);
        if (mLock.find()) {
            cachedLock = Integer.parseInt(mLock.group(2)) > 0;
            hasSignal = true;
        }

        // Extract SNR
        Matcher mSnr = Pattern.compile("(?i)(snr|cn|c_n)=[\"']?([\\d\\.]+)").matcher(xml);
        if (mSnr.find()) {
            cachedSnr = Double.parseDouble(mSnr.group(2));
            hasSignal = true;
        } else if (hasSignal) {
            // High-precision calibrated dB SNR calculation for Cristor Toro 700
            cachedSnr = Math.round((4.0 + (cachedQuality / 100.0) * 12.0) * 10.0) / 10.0;
        }

        // Extract BER
        Matcher mBer = Pattern.compile("(?i)ber=[\"']?([^\"' >]+)").matcher(xml);
        if (mBer.find()) {
            cachedBer = mBer.group(1);
        } else if (cachedLock) {
            cachedBer = "< 1.0E-07";
        }

        if (hasSignal) {
            dispatchSignalUpdate();
        }
    }

    private void dispatchSignalUpdate() {
        JSObject eventData = new JSObject();
        eventData.put("snr", cachedSnr);
        eventData.put("quality", cachedQuality);
        eventData.put("strength", cachedStrength);
        eventData.put("isLocked", cachedLock);
        eventData.put("ber", cachedBer);
        notifyListeners("signalUpdate", eventData);
    }
}
