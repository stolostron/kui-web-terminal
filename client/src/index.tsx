/*
 * Copyright (c) 2020 Red Hat, Inc.
 */
/*
 * Copyright 2020 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { render } from "react-dom";
import {
  Kui,
  ContextWidgets,
  MeterWidgets,
} from "@kui-shell/plugin-client-common";
import {
  CurrentContext,
  CurrentNamespace,
} from "@kui-shell/plugin-kubectl/components";
import CustomSearchInput from "@kui-shell/plugin-search/mdist/components/CustomSearchInput"
import { ClusterUtilization } from "@kui-shell/plugin-kubectl/view-utilization";
import { ProxyOfflineIndicator } from "@kui-shell/plugin-proxy-support";
import { productName } from '@kui-shell/client/config.d/name.json'

const wrapper = document.querySelector(".main");
if (wrapper) {
  render(
    <Kui bottomInput={<CustomSearchInput/>} productName={productName} noPromptContext prompt="&#x276f;">
      <ContextWidgets>
        <CurrentContext />
        <CurrentNamespace />
      </ContextWidgets>

      <MeterWidgets>
        <ClusterUtilization />
        <ProxyOfflineIndicator />
      </MeterWidgets>
    </Kui>,
    wrapper
  );
}
