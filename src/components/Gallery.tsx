import './Gallery.css';

function Gallery() {
    // tymczasowo puste placeholdery
    const photos = Array.from({ length: 12 });

    return (
        <section className="gallery">
            {photos.map((_, index) => (
                <div className="photo-placeholder" key={index}></div>
            ))}
        </section>
    );
}

export default Gallery;