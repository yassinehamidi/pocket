import { useRouter } from 'expo-router';

type Router = ReturnType<typeof useRouter>;

/**
 * Close a pushed/modal screen. Falls back to Home when there is no
 * back stack (e.g. the screen was opened via a deep link or reload).
 */
export function dismissScreen(router: Router) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}
