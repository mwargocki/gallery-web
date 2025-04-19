import './App.css';
import Header from './components/Header';
import Sidebar, { Filters } from './components/Sidebar';
import Gallery from './components/Gallery';
import { useState } from 'react';

function App() {
    const [filters, setFilters] = useState<Filters>({});

    return (
        <div className="app">
            <Header />
            <main className="main">
                <Sidebar onChange={setFilters} />
                <Gallery filters={filters} />
            </main>
        </div>
    );
}

export default App;
