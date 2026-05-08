import { useStore } from '../../store';
import { Sidebar } from './Sidebar';
import { Canvas2D } from '../canvas2d/Canvas2D';
import { Canvas3D } from '../canvas3d/Canvas3D';

export function MainLayout() {
  const viewMode = useStore(s => s.viewMode);

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden bg-gray-50">
        {viewMode === '2d' ? <Canvas2D /> : <Canvas3D />}
      </main>
    </div>
  );
}
