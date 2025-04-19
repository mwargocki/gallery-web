import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Gallery from './components/Gallery';

function App() {
    return (
        <div className="app">
            <Header />
            <main className="main">
                <Sidebar />
                <Gallery />
            </main>
        </div>
    );
}

export default App;