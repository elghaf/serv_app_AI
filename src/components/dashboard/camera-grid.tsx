'use client';

export function CameraGrid() {
  const cameras = [
    {
      id: 1,
      name: 'Camera 1',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      name: 'Camera 2',
      image: 'https://images.unsplash.com/photo-1621953724671-1d8d591fe775?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      name: 'Camera 3',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 4,
      name: 'Camera 4',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mt-6">
      {cameras.map((camera) => (
        <div
          key={camera.id}
          className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
        >
          <img src={camera.image} alt={camera.name} className="object-cover" />
        </div>
      ))}
    </div>
  );
}