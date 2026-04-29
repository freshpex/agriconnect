import { Redirect } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";
import { Loading } from "../src/components/ui";

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Loading message="Starting AgriConnect..." />;

  if (user) return <Redirect href="/(tabs)" />;

  return <Redirect href="/login" />;
}
