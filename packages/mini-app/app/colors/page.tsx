const Page = () => {
   return (
      <div className="">
         <button className="p-4 bg-background text-foreground">
            background foreground
         </button>
         <button className="p-4 bg-primary text-primary-foreground">
            primary foreground
         </button>
         <button className="p-4 bg-secondary text-secondary-foreground">
            secondary foreground
         </button>
         <button className="p-4 bg-popover text-popover-foreground">
            popover foreground
         </button>

         <button className="p-4 bg-card text-card-foreground">card text</button>

         <button className="p-4 bg-accent text-accent-foreground">
            accent
         </button>
         <button className="p-4 bg-muted text-muted-foreground">muted</button>
         <button className="p-4 bg-ring">ring</button>
         <button className="p-4 bg-destructive">destructive</button>
      </div>
   );
};

export default Page;
