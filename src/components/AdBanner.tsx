interface Ad {
  id: string;
  imageUrl: string;
  linkUrl: string;
  altText: string;
}

// Mock ads - i produktion hentes disse fra databasen
const mockAds: Record<string, Ad> = {
  left: {
    id: '1',
    imageUrl: 'https://placehold.co/160x600/228B22/white?text=Restaurant+Annonce',
    linkUrl: '#',
    altText: 'Lokal restaurant',
  },
  right: {
    id: '2',
    imageUrl: 'https://placehold.co/160x600/8B4513/white?text=Adventure+Park',
    linkUrl: '#',
    altText: 'Adventure Park',
  },
  bottom: {
    id: '3',
    imageUrl: 'https://placehold.co/728x90/FFD700/333?text=LEGOLAND+Billund+-+Book+nu!',
    linkUrl: '#',
    altText: 'LEGOLAND',
  },
};

interface AdBannerProps {
  position: 'left' | 'right' | 'bottom';
}

const AdBanner = ({ position }: AdBannerProps) => {
  const ad = mockAds[position];
  
  if (!ad) return null;

  const positionClasses = {
    left: 'w-[160px] h-[600px]',
    right: 'w-[160px] h-[600px]',
    bottom: 'w-full max-w-[728px] h-[90px] mx-auto',
  };

  return (
    // Hidden on mobile (hidden lg:block)
    <div className="hidden lg:block">
      <a 
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        <img 
          src={ad.imageUrl}
          alt={ad.altText}
          className={`${positionClasses[position]} object-cover rounded-lg`}
        />
      </a>
    </div>
  );
};

export default AdBanner;
