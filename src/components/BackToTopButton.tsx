import { useEffect, useState } from 'react';
import './BackToTopButton.css';

function BackToTopButton() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(document.getElementById('gallery-scroll')?.scrollTop! > 200);
        };

        const gallery = document.getElementById('gallery-scroll');
        gallery?.addEventListener('scroll', handleScroll);

        return () => gallery?.removeEventListener('scroll', handleScroll);
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
