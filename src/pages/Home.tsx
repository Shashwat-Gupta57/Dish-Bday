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

export default function Home() {
  const [activeHiddenPage, setActiveHiddenPage] = useState<'virgo' | 'vault' | 'dive' | null>(null);

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
      
      <HiddenPages 
        activePage={activeHiddenPage} 
        onClose={() => setActiveHiddenPage(null)} 
      />

      {activeHiddenPage === 'dive' && (
        <ArchiveDive onClose={() => setActiveHiddenPage(null)} />
      )}
    </main>
  );
}
