/*
   Copyright (C) 2022 Eric L. Solis.

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.  */

import axios from "axios";
import jsdom from "jsdom";
import url from "url";
const { JSDOM } = jsdom;
var AsciiTable = require("ascii-table");
import { head, isEmpty, isNil } from "lodash";

interface SubjectData {
  nrc: string;
  key: string;
  name: string;
  section: string;
  credits: number;
  schedule: string;
  slots: number;
  available: number;
  professor: string;
}

function dataToAscii(data: SubjectData[], key: string) {
  const firstRow = head(data);
  var table = new AsciiTable(`${key} -  ${firstRow?.name ?? ""}`);

  table.setHeading(
    "nrc",
    "key",
    "name",
    "section",
    "credits",
    "schedule",
    "slots",
    "available",
    "professor"
  );

  if (isEmpty(data)) {
    table.addRow("-", "-", "-", "-", "-", "-", "-", "-", "-");
  } else {
    data.forEach((subject) => {
      table.addRow(
        subject.nrc,
        subject.key,
        subject.name
          .split(" ")
          .map((word) => word[0])
          .join(""),
        subject.section,
        subject.credits,
        subject.schedule,
        subject.slots,
        subject.available,
        subject.professor
      );
    });
  }

  return table.toString();
}

async function fetchRawData(key: string): Promise<string> {
  const data = {
    ciclop: "202220",
    cup: "D",
    majrp: "",
    crsep: key,
    dispp: "D",
    ordenp: "0",
    mostrarp: "100",
  };
  const params = new url.URLSearchParams(data);
  const response = await axios.post(
    "http://consulta.siiau.udg.mx/wco/sspseca.consulta_oferta",
    params.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data;
}

function scrapScheduleRow(row: Element): string {
  if (isNil(row)) return "-";
  const columns = Array.from(row.children);
  const time = columns[1].textContent;
  const days = columns[2].textContent;
  return `${days} ${time}`;
}

function scrapRow(row: Element): SubjectData {
  const subjectData: Partial<SubjectData> = {};
  const columns = Array.from(row.children);
  subjectData.nrc = <string>columns[0].textContent;
  subjectData.key = <string>columns[1].children[0].textContent;
  subjectData.name = <string>columns[2].children[0].textContent;
  subjectData.section = <string>columns[3].textContent;
  subjectData.credits = +(<string>columns[4].textContent);
  subjectData.slots = +(<string>columns[5].textContent);
  subjectData.available = +(<string>columns[6].textContent);

  subjectData.schedule = scrapScheduleRow(
    columns[7].children?.[0]?.children?.[0]?.children[0]
  );

  subjectData.professor = <string>(
    columns[8].children?.[0]?.children?.[0]?.children?.[0]?.children[1]
      .textContent
  );

  return subjectData as SubjectData;
}

function scrapData(dom: jsdom.JSDOM): SubjectData[] {
  const mainDataTable = Array.from(
    dom.window.document.getElementsByTagName("table")
  )[0];
  const mainDataTableBody = mainDataTable.children[0];
  const dataRows = Array.from(mainDataTableBody.children).slice(2);
  const data = dataRows.map(scrapRow);
  return data;
}

async function main() {
  try {
    const mySubjects = ["I5899", "I7029", "I7042"];
    for (const subjectKey of mySubjects) {
      const rawData = await fetchRawData(subjectKey);
      const dom = new JSDOM(rawData);
      console.log(dataToAscii(scrapData(dom), subjectKey));
    }
  } catch (error) {
    console.error(error);
  }
}

main();
