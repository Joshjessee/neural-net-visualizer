import { Header } from './components/layout/Header';
import { MainLayout } from './components/layout/MainLayout';
import { StatusBar } from './components/layout/StatusBar';

export default function App() {
  return (
    <div className="h-full flex flex-col bg-white">
      <Header />
      <MainLayout />
      <StatusBar />
    </div>
  );
}
