import { router } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

export default function SignUpPage() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Sign Up Page</Text>
      <Text style={{ textAlign: "center", marginBottom: 40 }}>
        Here you could implement your Keycloak or email/password sign-up.
      </Text>
      <Button
        title="Back to Login"
        onPress={() => router.replace("/sign-in-page")}
      />
    </View>
  );
}
