import { Stack } from "expo-router";

/**
 * Layout wrapper for the PDF Templates pages
 */
export const PDFTemplatesLayoutWrapper = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
  </>
);

export default function PDFTemplatesLayout() {
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