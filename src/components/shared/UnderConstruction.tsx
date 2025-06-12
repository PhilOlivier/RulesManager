import React from 'react';
import { Construction } from 'lucide-react';

interface UnderConstructionProps {
  pageName: string;
}

const UnderConstruction: React.FC<UnderConstructionProps> = ({ pageName }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <Construction className="w-16 h-16 mb-4 text-primary" />
      <h1 className="text-4xl font-bold">Under Construction</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        The &quot;{pageName}&quot; page is currently being built.
      </p>
      <p className="mt-2 text-muted-foreground">
        Please check back later!
      </p>
    </div>
  );
};

export default UnderConstruction; 