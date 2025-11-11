// src/components/layout/HeroSlider.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { getOptimizedImage } from '@/lib/cloudinary';

interface SliderImage {
    imageUrl: string;
    link: string;
}

const HeroSlider = () => {
    const [images, setImages] = useState<SliderImage[]>([]);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchImages = async () => {
            const { data } = await axios.get(`${API_URL}/api/slider`);
            setImages(data);
        };
        fetchImages();
    }, [API_URL]);

    return (
        <Carousel 
            className="w-full"
            plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
            opts={{ loop: true }}
        >
            <CarouselContent className="h-[30vh] md:h-[80vh]">
                {images.map((image, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1 h-full">
                            <Card className="h-full">
                                <CardContent className="flex items-center justify-center p-0 h-full">
                                    <img 
                                        src={getOptimizedImage(image.imageUrl, 1200)} 
                                        alt={`Slider Image ${index + 1}`} 
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 bg-primary" />
            <CarouselNext className="absolute right-4 bg-primary" />
        </Carousel>
    );
};

export default HeroSlider;