// app/(auth-pages)/sign-in-page.tsx
import React, { useEffect, useState } from "react";
import { Text, View, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAuth, handleLogin, redirectUri } from "@/store/services/auth-service";
import {
  useAuthRequest,
  fetchDiscoveryAsync,
  DiscoveryDocument,
  ResponseType,
} from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const keycloakBaseUrl = "https://idp.signusk.com/realms/signusk";

export default function SignInPage() {
  const dispatch = useAppDispatch();
  const { isLoggedIn, loading, error } = useAppSelector(selectAuth);

  const [discovery, setDiscovery] = useState<DiscoveryDocument | null>(null);

  const [request, , promptAsync] = useAuthRequest(
    {
      clientId: "login-app",
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    fetchDiscoveryAsync(keycloakBaseUrl).then(setDiscovery);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/");
    }
  }, [isLoggedIn]);

  const handleOAuthLogin = () => {
    if (request && discovery) {
      dispatch(handleLogin({ request, promptAsync, discovery }));
    }
  };

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Sign In</Text>
        <Pressable
          onPress={handleOAuthLogin}
          style={{
            backgroundColor: loading ? "#999" : "#007AFF",
            padding: 15,
            borderRadius: 10,
            marginTop: 20,
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>
              Sign in with Keycloak
            </Text>
          )}
        </Pressable>

        {error && (
          <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>{error}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
