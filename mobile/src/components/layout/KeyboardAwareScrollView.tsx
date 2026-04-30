import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface KeyboardAwareScrollViewProps extends Omit<
  ScrollViewProps,
  "contentContainerStyle"
> {
  children: ReactNode;
  className?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  extraBottom?: number;
  extraTop?: number;
  includeBottomInset?: boolean;
  includeTopInset?: boolean;
  keyboardVerticalOffset?: number;
}

export function KeyboardAwareScrollView({
  children,
  className = "bg-white",
  contentContainerStyle,
  extraBottom = 24,
  extraTop = 0,
  includeBottomInset = true,
  includeTopInset = false,
  keyboardVerticalOffset,
  ...scrollProps
}: KeyboardAwareScrollViewProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = (includeTopInset ? insets.top : 0) + extraTop;
  const paddingBottom = (includeBottomInset ? insets.bottom : 0) + extraBottom;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className={`flex-1 ${className}`}
      keyboardVerticalOffset={
        keyboardVerticalOffset ?? (Platform.OS === "ios" ? insets.top : 0)
      }
    >
      <ScrollView
        {...scrollProps}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        className={`flex-1 ${className}`}
        contentContainerStyle={[
          {
            paddingTop,
            paddingBottom,
          },
          contentContainerStyle,
        ]}
        contentInsetAdjustmentBehavior={
          scrollProps.contentInsetAdjustmentBehavior ?? "automatic"
        }
        keyboardDismissMode={
          scrollProps.keyboardDismissMode ??
          (Platform.OS === "ios" ? "interactive" : "on-drag")
        }
        keyboardShouldPersistTaps={
          scrollProps.keyboardShouldPersistTaps ?? "handled"
        }
        scrollIndicatorInsets={{
          top: paddingTop,
          bottom: paddingBottom,
          ...scrollProps.scrollIndicatorInsets,
        }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
