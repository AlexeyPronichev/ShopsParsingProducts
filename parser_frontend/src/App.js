import 'bootstrap/dist/css/bootstrap.min.css';
import CategoryPage from './components/category/CategoryPage';
import ResultsPage from './components/results/ResultsPage';
import SocketsModal from './components/category/SocketsModal';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<CategoryPage />} />
        <Route path="/result" element={<ResultsPage />} />
      </Routes>
    </div>
  );
}

export default App;
