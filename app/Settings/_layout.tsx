import { Stack } from "expo-router";
import { router } from "expo-router";
import Content from "../../components/Content";

/**
 * Layout for the Settings section
 * @returns The settings layout component
 */
export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

/**
 * Settings layout wrapper component that provides consistent styling and navigation
 * @returns The settings layout wrapper component
 */
export const SettingsLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Content.Wrapper>
      <Content.Header
        left={<Content.BackButton onPress={() => router.replace("/")} />}
        title="Configurações"
      />
      <Content.Body>
        {children}
      </Content.Body>
    </Content.Wrapper>
  );
};
