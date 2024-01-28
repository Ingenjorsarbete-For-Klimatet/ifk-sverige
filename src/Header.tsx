import { useState } from "react";
import { create } from "zustand";

import {
  Button,
  Box,
  Flex,
  Popover,
  Tabs,
  Text,
  ScrollArea,
  Switch,
} from "@radix-ui/themes";
import { GlobeIcon, LayersIcon } from "@radix-ui/react-icons";

import AsyncSelect from "react-select/async";

import { FlyToInterpolator } from "@deck.gl/core/typed";

import { ground, road, construction, COLOR_CSS } from "./config";

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
  searchResult: {},
  searchView: {},
  toggleLayer: (type: string, selectedLayer: string, checked: boolean) =>
    set((state: any): any => ({
      layer: {
        ...state.layer,
        [type]: { ...state.layer[type], [selectedLayer]: checked },
      },
    })),
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
  return (
    <LayerLabel
      type={"ground"}
      value={ground[key]}
      label={key}
      checkedColor={COLOR_CSS[key]}
    />
  );
});

const roadList = Object.keys(road).map((key) => {
  return <LayerLabel type={"road"} value={road[key]} label={key} />;
});

function LayerLabel({ type, value, label, checkedColor }: any): any {
  const layer = useMenuStore((state: any) => state.layer);
  const toggleLayer = useMenuStore((state: any) => state.toggleLayer);
  console.log(checkedColor);

  return (
    <Text as="label" size="2">
      <Flex justify="between" gap="2" style={{ margin: "9px 0" }}>
        {label}
        <Switch
          id={value}
          checked={layer[type][value]}
          onCheckedChange={(e) => toggleLayer(type, value, e)}
          variant="classic"
        />
      </Flex>
    </Text>
  );
}

export function Header() {
  // @ts-ignore
  const [isClearable, setIsClearable] = useState(true);
  // @ts-ignore
  const [isSearchable, setIsSearchable] = useState(true);
  // @ts-ignore
  const [isDisabled, setIsDisabled] = useState(false);
  // @ts-ignore
  const [isLoading, setIsLoading] = useState(false);
  // @ts-ignore
  const [isRtl, setIsRtl] = useState(false);
  // @ts-ignore
  const searchResult = useMenuStore((state: any) => state.searchResult);
  // @ts-ignore
  const setSearchResult = useMenuStore((state: any) => state.setSearchResult);
  // @ts-ignore
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
    <Flex gap="2">
      <AsyncSelect
        classNames={{
          control: () =>
            "rt-reset rt-BaseButton rt-Button rt-r-size-3 rt-variant-outline",
          menuList: () => "rt-ScrollAreaRoot",
        }}
        styles={{
          control: (baseStyles, state) => ({
            ...baseStyles,
            width: "200px",
          }),
        }}
        placeholder="Sök karta"
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable={isClearable}
        isRtl={isRtl}
        isSearchable={isSearchable}
        getOptionLabel={(e: any) => `${e.textstrang} ${e.textkategori}`}
        getOptionValue={(e: any) => e.geometry_xy}
        cacheOptions
        defaultOptions={defaultSearchOptions}
        loadOptions={loadOptions}
        onChange={(e) => setSearchResult(e, setInitialViewState)}
      />
      <Popover.Root>
        <Popover.Trigger>
          <Button size="3" variant="outline">
            <GlobeIcon />
          </Button>
        </Popover.Trigger>
        <Popover.Content style={{ width: 300 }}>
          <Tabs.Root defaultValue="mark">
            <Tabs.List
              style={{ display: "flex", justifyContent: "space-around" }}
            >
              <Tabs.Trigger style={{ width: "25%" }} value="mark">
                Mark
              </Tabs.Trigger>
              <Tabs.Trigger style={{ width: "25%" }} value="vag">
                Väg
              </Tabs.Trigger>
              <Tabs.Trigger style={{ width: "25%" }} value="granser">
                Gränser
              </Tabs.Trigger>
              <Tabs.Trigger style={{ width: "25%" }} value="terrang">
                Terräng
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="mark">
              <ScrollArea scrollbars="vertical" style={{ height: 250 }}>
                <Box style={{ padding: "0 10px" }}>{groundList}</Box>
              </ScrollArea>
            </Tabs.Content>
            <Tabs.Content value="vag">
              <ScrollArea scrollbars="vertical" style={{ height: 250 }}>
                <Box style={{ padding: "0 10px" }}>{roadList}</Box>
              </ScrollArea>
            </Tabs.Content>
            <Tabs.Content value="granser"></Tabs.Content>
            <Tabs.Content value="terrang"></Tabs.Content>
          </Tabs.Root>
        </Popover.Content>
      </Popover.Root>
      <Popover.Root>
        <Popover.Trigger>
          <Button size="3" variant="outline">
            <LayersIcon />
          </Button>
        </Popover.Trigger>
        <Popover.Content style={{ width: 250 }}>
          <Tabs.Root defaultValue="vader">
            <Tabs.List
              style={{ display: "flex", justifyContent: "space-around" }}
            >
              <Tabs.Trigger style={{ width: "50%" }} value="vader">
                Väder
              </Tabs.Trigger>
              <Tabs.Trigger style={{ width: "50%" }} value="vatten">
                Vatten
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="vader">
              <ScrollArea scrollbars="vertical" style={{ height: 250 }}>
                <Box style={{ padding: "0 10px" }}>{roadList}</Box>
              </ScrollArea>
            </Tabs.Content>
            <Tabs.Content value="vatten">
              <ScrollArea scrollbars="vertical" style={{ height: 250 }}>
                <Box style={{ padding: "0 10px" }}>{roadList}</Box>
              </ScrollArea>
            </Tabs.Content>
          </Tabs.Root>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  );
}
