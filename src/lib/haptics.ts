import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { usePrefs } from '../store/prefsStore'

function enabled() {
  return usePrefs.getState().vibration
}

function safe(p: Promise<unknown>) {
  p.catch(() => {})
}

export const haptic = {
  light() {
    if (enabled()) safe(Haptics.impact({ style: ImpactStyle.Light }))
  },
  medium() {
    if (enabled()) safe(Haptics.impact({ style: ImpactStyle.Medium }))
  },
  heavy() {
    if (enabled()) safe(Haptics.impact({ style: ImpactStyle.Heavy }))
  },
  success() {
    if (enabled()) safe(Haptics.notification({ type: NotificationType.Success }))
  },
  warning() {
    if (enabled()) safe(Haptics.notification({ type: NotificationType.Warning }))
  },
}
