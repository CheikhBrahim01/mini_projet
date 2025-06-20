import React from "react";
import { View, Text, StyleSheet, Pressable, Button } from "react-native";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { selectIsLoggedIn } from "@/store/services/auth-service";
import { useTranslation } from "react-i18next";
import i18n from "@/src/i18n/i18n";

export default function Home() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const { t } = useTranslation();

  const handleViewProducts = () => {
    if (isLoggedIn) {
      router.push("/(screens)/products");
    } else {
      router.push("/(auth-pages)/sign-in-page");
    }
  };

  const handleChangeLanguage = (lang: "en" | "fr" | "ar") => {
    i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("welcome")}</Text>
      <Text style={styles.subtitle}>{t("productSubtitle")}</Text>

      <Pressable onPress={handleViewProducts} style={styles.link}>
        <Text style={styles.linkText}>{t("viewProducts")}</Text>
      </Pressable>

      <View style={styles.languageSwitcher}>
        <Button title="EN" onPress={() => handleChangeLanguage("en")} />
        <Button title="FR" onPress={() => handleChangeLanguage("fr")} />
        <Button title="AR" onPress={() => handleChangeLanguage("ar")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: "center", alignItems: "center",
    padding: 20, backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 10,
  },
  subtitle: {
    fontSize: 16, color: "#666", marginBottom: 30, textAlign: "center",
  },
  link: {
    backgroundColor: "#007AFF", paddingHorizontal: 30, paddingVertical: 15,
    borderRadius: 25, elevation: 5,
  },
  linkText: {
    color: "#fff", fontSize: 18, fontWeight: "bold",
  },
  languageSwitcher: {
    flexDirection: "row",
    marginTop: 40,
    justifyContent: "space-around",
    width: "60%",
  },
});
