import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <Skeleton className="h-40 w-full mb-4" />
            <Skeleton className="h-4 w-1/4 mb-6" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <Skeleton className="h-8 w-1/3 mb-6" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <Skeleton className="h-8 w-1/2 mb-6" />
            <div className="space-y-4">
              <div className="flex items-start">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <div className="flex items-start">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
              <div className="flex items-start">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-1/4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}