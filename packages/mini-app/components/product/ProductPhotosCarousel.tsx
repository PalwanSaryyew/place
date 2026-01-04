// components/product/ProductPhotosCarousel.tsx
import * as React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import FullScreenImageViewer from "./FullScreenImageViewer";

export function ProductPhotosCarousel({ imageUrls }: { imageUrls: string[] }) {
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

    const openFullScreen = (index: number) => {
        setCurrentImageIndex(index);
    };

    const closeFullScreen = () => {
        setCurrentImageIndex(null);
    };

    const handleNavigate = (newIndex: number) => {
        setCurrentImageIndex(newIndex);
    };

    return (
        <>
            <Carousel className="relative w-[80%] mx-auto">
                <CarouselContent>
                    {imageUrls.map((url, index) => (
                        <CarouselItem key={index} className="basis-full" onClick={() => openFullScreen(index)}>
                            <Card className="m-0 p-0 overflow-clip rounded-lg shadow-md">
                                <CardContent className="relative w-full aspect-video">
                                    <Image
                                        fill
                                        src={url}
                                        alt={`Product Photo ${index + 1}`}
                                        className="object-cover"
                                    />
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute -left-5 top-1/2 -translate-y-1/2 " variant={'secondary'} />
                <CarouselNext className="absolute -right-5 top-1/2 -translate-y-1/2 " variant={'secondary'} />
            </Carousel>
            {currentImageIndex !== null && (
                <FullScreenImageViewer
                    imageUrls={imageUrls}
                    currentImageIndex={currentImageIndex}
                    onClose={closeFullScreen}
                    onNavigate={handleNavigate}
                />
            )}
        </>
    );
}