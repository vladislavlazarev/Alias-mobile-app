import { ArrowDown, ArrowUp, Ban, Flag, Layers, MessageCircle, Timer, Trophy, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Screen, TopBar } from '../components/Screen'
import { useUi } from '../store/uiStore'

export function RulesScreen() {
  const go = useUi((s) => s.go)
  return (
    <Screen>
      <TopBar title="Как играть" onBack={() => go('home', -1)} />
      <div className="-mx-1 flex-1 overflow-y-auto px-1 pt-2 pb-6 no-scrollbar">
        <p className="px-1 text-[17px] leading-relaxed text-ink-200">
          Alias — командная игра в объяснение слов. Один игрок объясняет слово, его команда угадывает. Чем больше слов
          угадали за раунд — тем больше очков.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Rule icon={<Users className="size-5" />} title="Разбейтесь на команды">
            Минимум две команды по 2+ человека. Можно вписать имена игроков — приложение будет подсказывать, кто
            объясняет.
          </Rule>
          <Rule icon={<Layers className="size-5" />} title="Выберите слова">
            Любые уровни сложности, нужные темы и дополнительные наборы: литературные герои, исторические личности,
            фильмы, страны и многое другое.
          </Rule>
          <Rule icon={<Timer className="size-5" />} title="Объясняйте на время">
            Объясняющий видит слово и описывает его своей команде, пока идёт таймер.
          </Rule>
          <Rule icon={<Ban className="size-5" />} title="Чего нельзя">
            Называть слово и однокоренные слова, переводить на другие языки, показывать жестами и говорить «звучит
            как…».
          </Rule>
          <Rule icon={<ArrowUp className="size-5" />} title="Угадали — свайп вверх" tone="acid">
            +1 очко команде. Сразу появится следующее слово.
          </Rule>
          <Rule icon={<ArrowDown className="size-5" />} title="Не знаете — свайп вниз" tone="hot">
            Слово пропускается. Если включён штраф — команда теряет 1 очко.
          </Rule>
          <Rule icon={<Flag className="size-5" />} title="Последнее слово" tone="sun">
            Когда время вышло, слово на экране можно дообъяснить. Если включено «для всех» — угадать его может любая
            команда.
          </Rule>
          <Rule icon={<MessageCircle className="size-5" />} title="Проверка">
            После хода можно исправить ошибки: нажмите на слово, чтобы поменять его статус.
          </Rule>
          <Rule icon={<Trophy className="size-5" />} title="Победа">
            Побеждает команда, первой набравшая нужное число очков. Круг всегда доигрывается до конца, чтобы у всех было
            поровну ходов. При ничьей играется дополнительный круг.
          </Rule>
        </div>
      </div>
    </Screen>
  )
}

const tones = {
  default: 'bg-ink-800 text-ink-200',
  acid: 'bg-acid-400/15 text-acid-400',
  hot: 'bg-hot-400/15 text-hot-400',
  sun: 'bg-sun-400/15 text-sun-400',
}

function Rule({
  icon,
  title,
  children,
  tone = 'default',
}: {
  icon: ReactNode
  title: string
  children: ReactNode
  tone?: keyof typeof tones
}) {
  return (
    <div className="flex gap-3.5 rounded-3xl bg-ink-850 p-4 ring-1 ring-inset ring-ink-750">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span>
      <div>
        <h3 className="font-display font-bold tracking-tight">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-300">{children}</p>
      </div>
    </div>
  )
}
