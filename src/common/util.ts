import { programs } from "@metaplex/js";

export function filterGmoots(list: programs.metadata.Metadata[]) {
  const creatorKey = "8mxiQyfXpWdohutWgq652XQ5LT4AaX4Lf5c4gZsdNLfd";
  return list.filter((metadata) => {
    const creators = metadata.data.data.creators?.filter((creator) => {
      return (
        creator.address === creatorKey &&
        // This is incorrectly typed
        (creator.verified as unknown as number) === 1
      );
    });
    return creators && creators?.length > 0;
  });
}
