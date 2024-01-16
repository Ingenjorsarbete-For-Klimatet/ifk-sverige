import { useState } from "react";
import { create } from "zustand";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import AsyncSelect from "react-select/async";

import { FlyToInterpolator } from "@deck.gl/core/typed";

import { ground, road, construction } from "./config";

export function buildLayerStore(checked: boolean) {
  let result: { [index: string]: any } = {
    ground: {},
    road: {},
    construction: {},
  };
  for (const [_, value] of Object.entries(ground)) {
    result["ground"][value] = checked;
  }

  for (const [_, value] of Object.entries(road)) {
    result["road"][value] = checked;
  }

  for (const [_, value] of Object.entries(construction)) {
    result["construction"][value] = checked;
  }

  return result;
}

export const useMenuStore = create((set) => ({
  layer: buildLayerStore(true),
  toggleLayer: (type: string, selectedLayer: string, checked: boolean) =>
    set((state: any): any => ({
      layer: {
        ...state.layer,
        [type]: { ...state.layer[type], [selectedLayer]: checked },
      },
    })),
}));

export const useSearchStore = create((set) => ({
  searchResult: {},
  searchView: {},
  setSearchResult: (result: any, fun: any) => {
    const view = {
      latitude: result.geometry_xy[1],
      longitude: result.geometry_xy[0],
      zoom: 11,
      minZoom: 4,
      maxZoom: 14,
      pitch: 0,
      bearing: 0,
      transitionDuration: 3000,
      transitionInterpolator: new FlyToInterpolator(),
    };
    fun(view);
    return set(() => ({ searchResult: result, searchView: view }));
  },
}));

const options = ["Stockholm", "Göteborg", "Malmö"];

async function getDefaultSearchOptions(
  defaultOptions: Array<string>,
): Promise<any> {
  let options = [];

  for (const option of defaultOptions) {
    const optionResult = await loadOptions(option);
    const filteredOption = optionResult.filter(
      (item: any) =>
        item.textstrang === option && item.textkategori == "Tätort",
    )[0];
    options.push({
      textstrang: filteredOption.textstrang,
      textkategori: filteredOption.textkategori,
      textstorleksklass: Number(filteredOption.textstorleksklass),
      geometry_xy: filteredOption.geometry_xy,
    });
  }

  return options;
}

async function loadOptions(inputValue: string) {
  return fetch(
    `https://dev.sverige.ingenjorsarbeteforklimatet.se/search/${inputValue.toLowerCase()}`,
  )
    .then((res) => res.json())
    .catch((err) => console.log(err))
    .then((res) =>
      res["matches"].sort(function (first: any, second: any) {
        return second.textstorleksklass - first.textstorleksklass;
      }),
    );
}

const defaultSearchOptions = await getDefaultSearchOptions(options);

const groundList = Object.keys(ground).map((key) => {
  return <LayerLabel type={"ground"} value={ground[key]} label={key} />;
});

const roadList = Object.keys(road).map((key) => {
  return <LayerLabel type={"road"} value={road[key]} label={key} />;
});

function LayerLabel({ type, value, label }: any): any {
  const layer = useMenuStore((state: any) => state.layer);
  const toggleLayer = useMenuStore((state: any) => state.toggleLayer);

  return (
    <div className="flex items-center space-between space-x-2 space-y-2 pr-4">
      <Label htmlFor={value}>{label}</Label>
      <Switch
        id={value}
        checked={layer[type][value]}
        onCheckedChange={(e) => toggleLayer(type, value, e)}
      />
    </div>
  );
}

export function MainMenu() {
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const searchResult = useSearchStore((state: any) => state.searchResult);
  const setSearchResult = useSearchStore((state: any) => state.setSearchResult);
  const [initialViewState, setInitialViewState] = useState({
    latitude: 62.5,
    longitude: 16,
    zoom: 4,
    minZoom: 4,
    maxZoom: 14,
    maxPitch: 0,
    bearing: 0,
  });

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <AsyncSelect
            placeholder="Sök karta"
            isDisabled={isDisabled}
            isLoading={isLoading}
            isClearable={isClearable}
            isRtl={isRtl}
            isSearchable={isSearchable}
            getOptionLabel={(e) => `${e.textstrang} ${e.textkategori}`}
            getOptionValue={(e) => e.geometry_xy}
            className="w-[200px] p-0"
            cacheOptions
            defaultOptions={defaultSearchOptions}
            loadOptions={loadOptions}
            onChange={(e) => setSearchResult(e, setInitialViewState)}
          />
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Lager</Button>
            </PopoverTrigger>
            <PopoverContent className="w-[100%]">
              <Tabs defaultValue="mark" className="w-[300px]">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="mark">Mark</TabsTrigger>
                  <TabsTrigger value="vag">Väg</TabsTrigger>
                  <TabsTrigger value="granser">Gränser</TabsTrigger>
                  <TabsTrigger value="annat">Annat</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>
                <TabsContent value="mark">
                  <ScrollArea className="h-72">{groundList}</ScrollArea>
                </TabsContent>
                <TabsContent value="vag">
                  <ScrollArea className="h-72">{roadList}</ScrollArea>
                </TabsContent>
                <TabsContent value="granser"></TabsContent>
                <TabsContent value="annat"></TabsContent>
                <TabsContent value="data"></TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Om</Button>
            </PopoverTrigger>
            <PopoverContent>
              Karta över Sverige. Data från Lantmäteriet.
            </PopoverContent>
          </Popover>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Kontakt</Button>
            </PopoverTrigger>
            <PopoverContent>
              <a href="mailto:info@ingenjorsarbeteforklimatet.se">
                Kontakta oss
              </a>
              .
            </PopoverContent>
          </Popover>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
