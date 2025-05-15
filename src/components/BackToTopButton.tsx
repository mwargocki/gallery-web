import { useEffect, useState } from 'react';
import './BackToTopButton.css';

function BackToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const gallery = document.getElementById('gallery-scroll');
        if (!gallery) return;

        const handleScroll = () => {
            setVisible(gallery.scrollTop > 200);
        };

        gallery.addEventListener('scroll', handleScroll);
        handleScroll(); // uruchom raz przy montowaniu

        return () => gallery.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        const gallery = document.getElementById('gallery-scroll');
        gallery?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!visible) return null;

    return (
        <button className="back-to-top" onClick={scrollToTop}>
            ↑
        </button>
    );
}

export default BackToTopButton;
