import { Header } from './components/layout/Header';
import { MainLayout } from './components/layout/MainLayout';
import { StatusBar } from './components/layout/StatusBar';

export default function App() {
  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#0d1117', color: '#f0f6fc' }}>
      <Header />
      <MainLayout />
      <StatusBar />
    </div>
  );
}
