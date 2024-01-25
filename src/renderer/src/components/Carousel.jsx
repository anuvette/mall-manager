import React from 'react';
import '../assets/Carousel.css';

const images = [
  {
    id: 'slide-1',
    url: 'http://localhost:3000/image/maiya.jpg',
    alt: '3D rendering of an imaginary orange planet in space',
  },
  {
    id: 'slide-2',
    url: 'http://localhost:3000/image/maiya.jpg',
    alt: '3D rendering of an imaginary green planet in space',
  },
  {
    id: 'slide-3',
    url: 'http://localhost:3000/image/maiya.jpg',
    alt: '3D rendering of an imaginary blue planet in space',
  },
  // Add more image objects here as needed
];

function Carousel() {
  return (
    <section className="container">
      <div className="slider-wrapper">
        <div className="slider">
          {images.map((image) => (
            <img
              key={image.id}
              id={image.id}
              src={image.url}
              alt={image.alt}
            />
          ))}
        </div>
        <div className="slider-nav">
          {images.map((image) => (
            <a key={image.id} href={`#${image.id}`}></a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Carousel;
