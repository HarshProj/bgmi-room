import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './Components/Home.tsx';
import { Success } from './Components/Success.tsx';
import { Failure } from './Components/Failure.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Failure />} />
      </Routes>
    </Router>
  );
}

export default App;
