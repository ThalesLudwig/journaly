import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-navigation";
import { ActivityIndicator, Avatar, Button, Divider, Portal, Snackbar, TextInput, useTheme } from "react-native-paper";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import * as Clipboard from "expo-clipboard";
import { useWalletConnectModal } from "@walletconnect/modal-react-native";

import { styles } from "../styles/profileStyles";
import { RootState } from "../config/store";
import { setEmail, setName, setWallet } from "../config/profileSlice";
import { walletShortener } from "../utils/walletShortener";
import LogoutDialog from "../Components/LogoutDialog";
import Alert from "../Components/Alert";
import UserAvatar from "../Components/UserAvatar";

export default function Profile() {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { t } = useTranslation("common");
  const { provider, open: openConnectDialog, address, isConnected } = useWalletConnectModal();
  const { email, name, wallet } = useSelector((state: RootState) => state.profile);

  const [isLoading, setIsLoading] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const [emailInput, setEmailInput] = useState(email);
  const [isConfirmSnackbarVisible, setIsConfirmSnackbarVisible] = useState(false);
  const [isCopySnackbarVisible, setIsCopySnackbarVisible] = useState(false);
  const [isLogoutDialogVisible, setIsLogoutDialogVisible] = useState(false);

  useEffect(() => {
    if (address) dispatch(setWallet(address));
  }, [isConnected, address]);

  const copyToClipboard = async () => {
    if (!wallet) return;
    await Clipboard.setStringAsync(wallet);
    setIsCopySnackbarVisible(true);
  };

  const onUpdate = () => {
    dispatch(setName(nameInput));
    dispatch(setEmail(emailInput));
    setIsConfirmSnackbarVisible(true);
  };

  const logout = async () => {
    setIsLoading(true);
    setIsLogoutDialogVisible(false);
    await provider?.disconnect();
    dispatch(setWallet(""));
    setIsLoading(false);
  };

  const onLogin = async () => {
    setIsLoading(true);
    await openConnectDialog({ route: "ConnectWallet" });
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: colors.background }}>
      <ScrollView>
        <View style={styles.body}>
          <View style={styles.avatar}>
            {!wallet && <Avatar.Icon icon="account-outline" size={70} />}
            {!!wallet && <UserAvatar />}
          </View>
          <TextInput label={t("common:profile.inputs.name")} value={nameInput} onChangeText={setNameInput} />
          <TextInput label={t("common:profile.inputs.email")} value={emailInput} onChangeText={setEmailInput} />
          <Alert icon="alert" text={t("common:profile.descriptions.therapy-share")} />
          <Divider />
          <TextInput
            disabled
            label={t("common:wallet")}
            value={walletShortener(wallet).toUpperCase()}
            right={<TextInput.Icon icon="content-copy" onPress={copyToClipboard} />}
          />
          <Button mode="contained" onPress={onUpdate}>
            {t("common:profile.buttons.update").toUpperCase()}
          </Button>
          {!!wallet && !isLoading && (
            <Button mode="contained-tonal" onPress={() => setIsLogoutDialogVisible(true)}>
              {t("common:settings.buttons.logout").toUpperCase()}
            </Button>
          )}
          {!wallet && !isLoading && (
            <Button mode="contained-tonal" onPress={onLogin}>
              {t("common:settings.buttons.login").toUpperCase()}
            </Button>
          )}
          {isLoading && <ActivityIndicator />}
        </View>
      </ScrollView>
      <Portal>
        <Snackbar
          visible={isConfirmSnackbarVisible}
          onDismiss={() => setIsConfirmSnackbarVisible(false)}
          wrapperStyle={{ bottom: 80 }}
          action={{ label: t("common:settings.buttons.close"), onPress: () => setIsConfirmSnackbarVisible(false) }}
        >
          {t("common:profile.snackbar.updated")}
        </Snackbar>
        <Snackbar
          visible={isCopySnackbarVisible}
          onDismiss={() => setIsCopySnackbarVisible(false)}
          wrapperStyle={{ bottom: 80 }}
          action={{ label: t("common:settings.buttons.close"), onPress: () => setIsCopySnackbarVisible(false) }}
        >
          {t("common:profile.snackbar.copy")}
        </Snackbar>
        <LogoutDialog isOpen={isLogoutDialogVisible} onLogout={logout} setIsOpen={setIsLogoutDialogVisible} />
      </Portal>
    </SafeAreaView>
  );
}
