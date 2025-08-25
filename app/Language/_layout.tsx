import { Stack } from "expo-router";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import Content from "../../components/Content";

/**
 * Layout for the Language section
 * @returns The language layout component
 */
export default function LanguageLayout() {
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
 * Language layout wrapper component that provides consistent styling and navigation
 * @returns The language layout wrapper component
 */
export const LanguageLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  
  return (
    <Content.Wrapper>
      <Content.Header
        left={<Content.BackButton onPress={() => router.back()} />}
        title={t('settings.idioma')}
      />
      <Content.Body>
        {children}
      </Content.Body>
    </Content.Wrapper>
  );
};
