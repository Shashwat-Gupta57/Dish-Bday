import { useState } from 'react';
import Cover from '../components/Cover';
import Prologue from '../components/Prologue';
import Timeline from '../components/Timeline';
import Letters from '../components/Letters';
import Finale from '../components/Finale';
import HiddenPages from '../components/HiddenPages';
import SecretReveal from '../components/SecretReveal';
import Roast from '../components/Roast';
import FoodieGame from '../components/FoodieGame';
import ArchiveDive from '../components/ArchiveDive';

type HiddenPage = 'virgo' | 'vault' | 'dive';

export default function Home() {
  const [activeHiddenPage, setActiveHiddenPage] = useState<HiddenPage | null>(null);
  const close = () => setActiveHiddenPage(null);

  return (
    <main className="w-full bg-editorial-cream selection:bg-editorial-accent selection:text-editorial-cream">
      <Cover />
      <Prologue openPage={setActiveHiddenPage} />
      <Timeline openPage={setActiveHiddenPage} />
      <FoodieGame />
      <Letters />
      <Roast />
      <Finale />
      <SecretReveal />

      {/* HiddenPages only knows about the two overlay pages; the dive is its own
          full-screen thing. Narrowing here instead of widening its prop type. */}
      <HiddenPages
        activePage={activeHiddenPage === 'dive' ? null : activeHiddenPage}
        onClose={close}
      />

      {activeHiddenPage === 'dive' && <ArchiveDive onClose={close} />}
    </main>
  );
}
