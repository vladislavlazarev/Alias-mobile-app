# Релиз в App Store и Google Play

Нативные проекты уже лежат в репозитории (`ios/`, `android/`) и настроены: иконки, сплэш, тёмные системные панели,
портретная ориентация, версия 1.0.0, privacy manifest для Apple. Ниже — что осталось сделать руками.

## 0. Перед первым релизом

### Название и товарный знак

ALIAS — зарегистрированный товарный знак Tactic Games (настольная игра «Alias / Скажи иначе»). В магазинах есть
приложения с этим словом в названии, но Apple и Google вправе отклонить приложение или удалить его по жалобе
правообладателя. Безопаснее выбрать собственное название и оставить «алиас» в ключевых словах.

Где меняется название:

| Файл | Что поменять |
| --- | --- |
| `capacitor.config.ts` | `appName` |
| `ios/App/App/Info.plist` | `CFBundleDisplayName` |
| `android/app/src/main/res/values/strings.xml` | `app_name`, `title_activity_main` |
| `index.html` | `<title>` |
| `src/components/Logo.tsx` | надпись на главном экране |
| `store/listing-ru.md` | тексты карточек |

### Идентификатор приложения

Сейчас это `com.vlazarev.alias`. После первой загрузки в магазин его нельзя сменить, поэтому решите заранее.
Места, где он записан:

- `capacitor.config.ts` → `appId`;
- `android/app/build.gradle` → `namespace` и `applicationId`;
- `android/app/src/main/java/com/vlazarev/alias/MainActivity.java` → строка `package` и путь к папке;
- `ios/App/App.xcodeproj/project.pbxproj` → `PRODUCT_BUNDLE_IDENTIFIER` (проще поменять в Xcode: target App → General → Bundle Identifier).

### Политика конфиденциальности

Оба магазина требуют ссылку на политику. Текст готов: `docs/privacy-policy.md` — впишите туда свою почту и
опубликуйте на любой публичной странице (GitHub Pages, Notion, Telegraph). Эту ссылку нужно указать в App Store
Connect и Google Play Console.

## 1. Общий цикл

```bash
npm install
npm run cap:sync        # сборка веб-части и копирование в оба нативных проекта
```

После любых изменений веб-кода снова выполните `npm run cap:sync` (или `npm run cap:ios` / `npm run cap:android`,
которые заодно открывают IDE).

Иконка и сплэш генерируются из `resources/icon.png` (1024×1024) и `resources/splash.png` (2732×2732):

```bash
npm run cap:assets
```

## 2. Google Play

Нужно: JDK 21 и Android Studio (или Android SDK с платформой 36).

### Тестовый APK

```bash
cd android
./gradlew assembleDebug          # app/build/outputs/apk/debug/app-debug.apk
```

Такой APK подписан отладочным ключом: его можно поставить на телефон (разрешите установку из неизвестных
источников), но не загрузить в Google Play.

### Ключ подписи релиза

Один раз создайте ключ и **сохраните его и пароли в надёжном месте** — без него нельзя выпускать обновления:

```bash
cd android
keytool -genkeypair -v -keystore alias-release.jks -alias alias -keyalg RSA -keysize 2048 -validity 10000
```

Создайте `android/keystore.properties` (файл и ключ уже в `.gitignore`):

```properties
storeFile=alias-release.jks
storePassword=ваш-пароль
keyAlias=alias
keyPassword=ваш-пароль
```

### Сборка для магазина

```bash
cd android
./gradlew bundleRelease          # app/build/outputs/bundle/release/app-release.aab
```

### Google Play Console

1. Аккаунт разработчика (разовый взнос 25 $).
2. «Создать приложение» → язык по умолчанию русский, игра, бесплатно.
3. Карточка: тексты из `store/listing-ru.md`, иконка `store/play-icon-512.png`, баннер
   `store/play-feature-1024x500.png`, скриншоты `store/screenshots/android/`.
4. Анкеты: возрастной рейтинг (IARC), Data safety — «данные не собираются», целевая аудитория, реклама — нет,
   доступ к приложению — без входа.
5. Загрузите `app-release.aab` во внутреннее тестирование, затем в продакшен.
   Для новых личных аккаунтов Google требует перед продакшеном закрытое тестирование: 12 тестировщиков в течение 14 дней.
6. Перед каждой новой загрузкой увеличивайте `versionCode` (и `versionName`) в `android/app/build.gradle`.

## 3. App Store

Нужно: Mac с актуальным Xcode и участие в Apple Developer Program (99 $ в год).

### Проект уже настроен

- только iPhone, портретная ориентация (iPad запускает iPhone-версию; скриншоты для iPad не нужны);
- минимальная версия iOS 16.4 — этого требуют стили Tailwind CSS 4;
- `PrivacyInfo.xcprivacy`: трекинга нет, данные не собираются, указаны причины использования UserDefaults и меток
  времени файлов;
- `ITSAppUsesNonExemptEncryption = NO` — вопрос про экспорт шифрования не появится;
- зависимости подключаются через Swift Package Manager, CocoaPods не нужен.

### Сборка и загрузка

1. `npm run cap:ios` — соберёт веб-часть и откроет проект в Xcode.
2. Target **App** → **Signing & Capabilities** → выберите свою Team (Xcode сам создаст сертификаты и профиль).
3. В App Store Connect → «Мои приложения» → «+» → новое приложение: платформа iOS, основной язык русский,
   Bundle ID из шага 0, любой SKU.
4. В Xcode выберите устройство **Any iOS Device (arm64)** → Product → **Archive**.
5. В открывшемся Organizer → **Distribute App** → **App Store Connect** → Upload.
6. Через 10–30 минут сборка появится в TestFlight — поставьте её себе и проверьте.

### Карточка в App Store Connect

- Тексты, ключевые слова и категории — из `store/listing-ru.md`.
- Скриншоты — `store/screenshots/ios/` (1290×2796, слот iPhone 6.9").
- App Privacy → **Data Not Collected**.
- Возрастной рейтинг: на все вопросы «Нет» → 4+.
- Ссылка на политику конфиденциальности и страницу поддержки (можно ту же страницу).
- Заметка для ревьюера: «Офлайн-игра, регистрация не нужна. Нажмите „Новая игра“ → „Дальше“ → „Дальше“ → „Начать игру“».
- Выберите загруженную сборку → «Отправить на проверку».

Перед следующей загрузкой увеличьте Build (и Version для нового релиза) в Xcode: target App → General → Identity.

## 4. Выпуск обновления

1. Внесите изменения (например, новые слова в `words/ru/` и `npm run words:build`).
2. Поднимите версию: `package.json`, `android/app/build.gradle` (`versionCode`, `versionName`), в Xcode — Version и Build.
3. `npm run cap:sync`, затем сборка и загрузка по шагам выше.
