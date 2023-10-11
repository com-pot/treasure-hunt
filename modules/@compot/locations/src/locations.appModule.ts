import { AppModule } from "../../../../src/app/types/app";

export const entities: AppModule['entities'] = {
    Map: {
        primaryKey: "name",
        stringify: "name",
    },
    MapCoords: {
        publish: false,
    },
    Place: {
        primaryKey: "slug",
    },
}
