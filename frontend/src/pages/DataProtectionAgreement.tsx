import { Helmet } from "react-helmet";
import { User } from "../api/types";
import { useContext } from "react";
import { AuthContext } from "../providers/AuthProvider";

export default function DataProtectionAgreement() {
  const { authUser } = useContext(AuthContext);
  return (
    <>
      <Helmet>
        <title>The Clothing Loop | Data Protection Agreement</title>
        <meta name="description" content="Data Protection Agreement" />
      </Helmet>
      <div className="container mx-auto px-4 md:px-20 py-10">
        <h1 className="font-serif text-secondary font-bold text-5xl mb-4">
          {"Data Protection Agreement - The Clothing Loop"}
        </h1>

        <DataProtectionAgreementHTML
          className="prose"
          authUser={authUser?.accepted_dpa === true ? authUser : null}
        />
      </div>
    </>
  );
}

interface DataProtectionAgreementHTMLProps {
  className: string;
  authUser: User | undefined | null;
}

export function DataProtectionAgreementHTML(
  props: DataProtectionAgreementHTMLProps
) {
  return (
    <div className={props.className}>
      <p>Version dated 2023, December 21th</p>

      <h2>Data Protection Agreement</h2>

      <table className="table mx-auto text-center w-auto border border-base-200">
        <tbody>
          <tr>
            <td className="font-bold py-1 px-2">Data Processing Agreement</td>
          </tr>
          <tr>
            <td className="py-1 px-2">between</td>
          </tr>
          <tr>
            <td className="font-bold py-1 px-2">
              {props.authUser?.name || "a host of the Clothing Loop"}
            </td>
          </tr>
          <tr>
            <td className="py-1 px-2">as Controller</td>
          </tr>
          <tr>
            <td className="py-1 px-2">and</td>
          </tr>
          <tr>
            <td className="font-bold py-1 px-2">Slow Fashion Movement</td>
          </tr>
          <tr>
            <td className="py-1 px-2">as Processor</td>
          </tr>
        </tbody>
      </table>

      <h3 id="dpa-toc">TABLE OF CONTENTS</h3>

      <table className="table w-full [&_td:last-of-type]:text-center [&_td]:px-1 [&_th]:px-1">
        <thead>
          <tr className="font-sans">
            <th colSpan={2}>Clause</th>
            <th className="w-20 text-center font-serif!">Page</th>
          </tr>
        </thead>
        <tbody className="[&_td:last-of-type]:font-bold">
          <tr>
            <td colSpan={2}>SECTION I</td>
            <td>
              <a href="#dpa-page-1">1</a>
            </td>
          </tr>
          <tr>
            <td className="w-10 text-right">1</td>
            <td>CLAUSE 1</td>
            <td>
              <a href="#dpa-page-1">1</a>
            </td>
          </tr>
          <tr>
            <td className="text-right">2</td>
            <td>CLAUSE 2</td>
            <td>
              <a href="#dpa-page-1">1</a>
            </td>
          </tr>
          <tr>
            <td className="text-right">3</td>
            <td>CLAUSE 3</td>
            <td>
              <a href="#dpa-page-2">2</a>
            </td>
          </tr>
          <tr>
            <td className="text-right">4</td>
            <td>CLAUSE 4</td>
            <td>
              <a href="#dpa-page-2">2</a>
            </td>
          </tr>
          <tr>
            <td className="text-right">5</td>
            <td>CLAUSE 5 (Optional)</td>
            <td>
              <a href="#dpa-page-2">2</a>
            </td>
          </tr>
          <tr>
            <td colSpan={2}>SECTION II – OBLIGATIONS OF THE PARTIES</td>
            <td>
              <a href="#dpa-page-2">2</a>
            </td>
          </tr>
          <tr>
            <td className="text-right">6</td>
            <td>CLAUSE 6</td>
            <td>
              <a href="#dpa-page-2">2</a>
            </td>
          </tr>
          <tr>
            <td className="text-right">7</td>
            <td>CLAUSE 7</td>
            <td>
              <a href="#dpa-page-2">2</a>
            </td>
          </tr>
          <tr>
            <td className="text-right">8</td>
            <td>CLAUSE 8</td>
            <td>
              <a href="#dpa-page-5">5</a>
            </td>
          </tr>
          <tr>
            <td className="text-right">9</td>
            <td>CLAUSE 9</td>
            <td>
              <a href="#dpa-page-5">5</a>
            </td>
          </tr>
          <tr>
            <td colSpan={2}>SECTION III – FINAL PROVISIONS</td>
            <td>
              <a href="#dpa-page-6">6</a>
            </td>
          </tr>
          <tr>
            <td className="text-center">10</td>
            <td>CLAUSE 10</td>
            <td>
              <a href="#dpa-page-6">6</a>
            </td>
          </tr>
        </tbody>
      </table>

      <h3 id="dpa-schedules">Schedules</h3>
      <table className="table w-full [&_td:last-of-type]:text-center [&_td]:px-1 [&_th]:px-1">
        <tbody>
          <tr>
            <td>Schedule 1 List of parties</td>
            <td className="font-bold w-20">
              <a href="#dpa-page-schedule-1">1</a>
            </td>
          </tr>
          <tr>
            <td>Schedule 2 Description of the processing</td>
            <td className="font-bold">
              <a href="#dpa-page-schedule-2">2</a>
            </td>
          </tr>
          <tr>
            <td>
              Schedule 3 Technical and organisational measures including
              technical and organisational measures to ensure the security of
              the data
            </td>
            <td className="font-bold">
              <a href="#dpa-page-schedule-3">3</a>
            </td>
          </tr>
          <tr>
            <td>List of sub-processors</td>
            <td className="font-bold">
              <a href="#dpa-page-schedule-4">4</a>
            </td>
          </tr>
        </tbody>
      </table>

      <hr id="dpa-page-1" className="-mx-10" />
      <p>
        <strong>This Data Processing Agreement</strong> (the{" "}
        <strong>DPA</strong>) is made by and between:
      </p>
      <ol>
        <li>
          <p>Host (as defined in the Terms of Hosting) (Controller); and</p>
        </li>
        <li>
          <p>Slow Fashion Movement&nbsp;(Processor).</p>
        </li>
      </ol>
      <p>
        The parties referred to under 1 and 2 are hereinafter jointly referred
        to as the Parties.
      </p>
      <h3 id="dpa-section-1">SECTION I</h3>
      <ol className="list-custom">
        <li>
          <p>CLAUSE 1</p>
          <ol>
            <li>
              <p>
                <i>Purpose and scope</i>
              </p>

              <ol>
                <li>
                  <p>
                    The purpose of these Standard Contractual Clauses (the
                    Clauses) is to ensure compliance with Article 28(3) and (4)
                    of Regulation (EU) 2016/679 of the European Parliament and
                    of the Council of 27 April 2016 on the protection of natural
                    persons with regard to the processing of personal data and
                    on the free movement of such data, and repealing Directive
                    95/46/EC (General Data Protection Regulation).
                  </p>
                </li>
                <li>
                  <p>
                    The controllers and processors listed in Schedule 1 have
                    agreed to these Clauses in order to ensure compliance with
                    Article 28(3) and (4) of Regulation (EU) 2016/679 and/or
                    Article 29(3) and (4) of Regulation (EU) 2018/1725.
                  </p>
                </li>
                <li>
                  <p>
                    These Clauses apply to the processing of personal data as
                    specified in Schedule 2.
                  </p>
                </li>
                <li>
                  <p>Schedules 1 to 4 are an integral part of the Clauses.</p>
                </li>
                <li>
                  <p>
                    These Clauses are without prejudice to obligations to which
                    the Controller is subject by virtue of Regulation (EU)
                    2016/679 and/or Regulation (EU) 2018/1725.
                  </p>
                </li>
                <li>
                  <p>
                    These Clauses do not by themselves ensure compliance with
                    obligations related to international transfers in accordance
                    with Chapter V of Regulation (EU) 2016/679 and/or Regulation
                    (EU) 2018/1725.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>

        <li>
          <p>CLAUSE 2</p>
          <ol>
            <li>
              <p>
                <i>Invariability of the Clauses</i>
              </p>
              <ol>
                <li>
                  <p>
                    The Parties undertake not to modify the Clauses, except for
                    adding information to the Schedules or updating information
                    in them.
                  </p>
                </li>
                <li>
                  <p>
                    This does not prevent the Parties from including the
                    standard contractual clauses laid down in these Clauses in a
                    broader contract, or from adding other clauses or additional
                    safeguards provided that they do not directly or indirectly
                    contradict the Clauses or detract from the fundamental
                    rights or freedoms of data subjects.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
        <li>
          <p>CLAUSE 3</p>
          <ol>
            <li>
              <p>
                <i>Interpretation</i>
              </p>
              <ol>
                <li>
                  <p>
                    Where these Clauses use the terms defined in Regulation (EU)
                    2016/679 or Regulation (EU) 2018/1725 respectively, those
                    terms shall have the same meaning as in that Regulation.
                  </p>
                </li>
                <li>
                  <p>
                    These Clauses shall be read and interpreted in the light of
                    the provisions of Regulation (EU) 2016/679 or Regulation
                    (EU) 2018/1725 respectively.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
      </ol>

      <p className="text-base-300 text-center tracking-widest">1/7</p>
      <hr id="dpa-page-2" className="-mx-10" />
      <ol className="list-custom [counter-set:i_2]">
        <li>
          <ol>
            <li>
              <ol className="[counter-set:iii_2]">
                <li>
                  <p>
                    These Clauses shall not be interpreted in a way that runs
                    counter to the rights and obligations provided for in
                    Regulation (EU) 2016/679 / Regulation (EU) 2018/1725 or in a
                    way that prejudices the fundamental rights or freedoms of
                    the data subjects.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
        <li>
          <p>CLAUSE 4</p>
          <p>
            <i>Hierarchy</i>
          </p>
          <p>
            In the event of a contradiction between these Clauses and the
            provisions of related agreements between the Parties existing at the
            time when these Clauses are agreed or entered into thereafter, these
            Clauses shall prevail.
          </p>
        </li>
        <li>
          <p>CLAUSE 5 - Not applicable</p>
        </li>
      </ol>
      <h3 id="dpa-section-2">SECTION II – OBLIGATIONS OF THE PARTIES</h3>
      <ol className="list-custom [counter-set:i_5]">
        <li>
          <p>CLAUSE 6</p>
          <p>
            <i>Description of processing(s) </i>
          </p>
          <p>
            The details of the processing operations, in particular the
            categories of personal data and the purposes of processing for which
            the personal data is processed on behalf of the Controller, are
            specified in Schedule 2.
          </p>
        </li>
        <li>
          <p>CLAUSE 7</p>
          <p>
            <i>Obligations of the Parties</i>
          </p>

          <ol>
            <li>
              <p>Instructions</p>
              <ol>
                <li>
                  <p>
                    The Processor shall process personal data only on documented
                    instructions from the Controller, unless required to do so
                    by Union or Member State law to which the Processor is
                    subject. In this case, the Processor shall inform the
                    Controller of that legal requirement before processing,
                    unless the law prohibits this on important grounds of public
                    interest. Subsequent instructions may also be given by the
                    Controller throughout the duration of the processing of
                    personal data. These instructions shall always be
                    documented.
                  </p>
                </li>
                <li>
                  <p>
                    The Processor shall immediately inform the Controller if, in
                    the Processor’s opinion, instructions given by the
                    Controller infringe Regulation (EU) 2016/679 / Regulation
                    (EU) 2018/1725 or the applicable Union or Member State data
                    protection provisions.
                  </p>
                </li>
              </ol>
            </li>
            <li>
              <p>Purpose limitation</p>
              <p>
                The Processor shall process the personal data only for the
                specific purpose(s) of the processing, as set out in Schedule 2,
                unless it receives further instructions from the Controller.
              </p>
            </li>
            <li>
              <p>Duration of the processing of personal data</p>
              <p>
                Processing by the Processor shall only take place for the
                duration specified in Schedule 2.
              </p>
            </li>
            <li>
              <p>Security of processing</p>
              <ol>
                <li>
                  <p>
                    The Processor shall at least implement the technical and
                    organisational measures specified in Schedule 3 to ensure
                    the security of the personal data. This includes protecting
                    the data against a breach of security leading to accidental
                    or unlawful destruction, loss, alteration, unauthorised
                    disclosure or access to the data (personal data breach). In
                    assessing the appropriate level of security, the Parties
                    shall take due account of the state of the art, the costs of
                    implementation, the nature, scope, context and purposes of
                    processing and the risks involved for the data subjects.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
      </ol>

      <p className="text-base-300 text-center tracking-widest">2/7</p>
      <hr id="dpa-page-3" className="-mx-10" />
      <ol className="list-custom [counter-set:i_6]">
        <li>
          <ol className="[counter-set:ii_3]">
            <li>
              <ol className="[counter-set:iii_1]">
                <li>
                  <p>
                    The Processor shall grant access to the personal data
                    undergoing processing to members of its personnel only to
                    the extent strictly necessary for implementing, managing and
                    monitoring of the contract. The Processor shall ensure that
                    persons authorised to process the personal data received
                    have committed themselves to confidentiality or are under an
                    appropriate statutory obligation of confidentiality.
                  </p>
                </li>
              </ol>
            </li>
            <li>
              <p>Sensitive data</p>
              <ol>
                <li>
                  <p>
                    If the processing involves personal data revealing racial or
                    ethnic origin, political opinions, religious or
                    philosophical beliefs, or trade union membership, genetic
                    data or biometric data for the purpose of uniquely
                    identifying a natural person, data concerning health or a
                    person’s sex life or sexual orientation, or data relating to
                    criminal convictions and offences (“sensitive data”), the
                    Processor shall apply specific restrictions and/or
                    additional safeguards.
                  </p>
                </li>
              </ol>
            </li>
            <li>
              <p>Documentation and compliance</p>
              <ol>
                <li>
                  <p>
                    The Parties shall be able to demonstrate compliance with
                    these Clauses.
                  </p>
                </li>
                <li>
                  <p>
                    The Processor shall deal promptly and adequately with
                    inquiries from the Controller about the processing of data
                    in accordance with these Clauses.
                  </p>
                </li>
                <li>
                  <p>
                    The Processor shall make available to the Controller all
                    information necessary to demonstrate compliance with the
                    obligations that are set out in these Clauses and stem
                    directly from Regulation (EU) 2016/679 and/or Regulation
                    (EU) 2018/1725. At the Controller’s request, the Processor
                    shall also permit and contribute to audits of the processing
                    activities covered by these Clauses, at reasonable intervals
                    or if there are indications of non-compliance. In deciding
                    on a review or an audit, the Controller may take into
                    account relevant certifications held by the Processor.
                  </p>
                </li>
                <li>
                  <p>
                    The Controller may choose to conduct the audit by itself or
                    mandate an independent auditor. Audits may also include
                    inspections at the premises or physical facilities of the
                    Processor and shall, where appropriate, be carried out with
                    reasonable notice.
                  </p>
                </li>
                <li>
                  <p>
                    The Parties shall make the information referred to in this
                    Clause, including the results of any audits, available to
                    the competent supervisory authority/ies on request.
                  </p>
                </li>
              </ol>
            </li>
            <li>
              <p>Use of sub-processors</p>
              <ol>
                <li>
                  <p>
                    The Processor has the Controller’s general authorisation for
                    the engagement of sub-processors from an agreed list. The
                    Processor shall specifically inform in writing the
                    Controller of any intended changes of that list through the
                    addition or replacement of sub-processors at least 7 days in
                    advance, thereby giving the Controller sufficient time to be
                    able to object to such changes prior to the engagement of
                    the concerned sub-processor(s). The Processor shall provide
                    the Controller with the information necessary to enable the
                    Controller to exercise the right to object.
                  </p>
                </li>
                <li>
                  <p>
                    Where the Processor engages a sub-processor for carrying out
                    specific processing activities (on behalf of the
                    Controller), it shall do so by way of a contract which
                    imposes on the sub-processor, in substance, the same data
                    protection obligations as the ones imposed on the data
                    Processor in accordance with these Clauses. The Processor
                    shall ensure that the sub-processor complies with the
                    obligations to which the Processor is subject pursuant to
                    these Clauses and to Regulation (EU) 2016/679 and/or
                    Regulation (EU) 2018/1725.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
      </ol>

      <p className="text-base-300 text-center tracking-widest">3/7</p>
      <hr id="dpa-page-4" className="-mx-10" />
      <ol className="list-custom [counter-set:i_6]">
        <li>
          <ol className="[counter-set:ii_6]">
            <li>
              <ol className="[counter-set:iii_2]">
                <li>
                  <p>
                    At the Controller’s request, the Processor shall provide a
                    copy of such a sub-processor agreement and any subsequent
                    amendments to the Controller. To the extent necessary to
                    protect business secret or other confidential information,
                    including personal data, the Processor may redact the text
                    of the agreement prior to sharing the copy.
                  </p>
                </li>
                <li>
                  <p>
                    The Processor shall remain fully responsible to the
                    Controller for the performance of the sub-processor’s
                    obligations in accordance with its contract with the
                    Processor. The Processor shall notify the Controller of any
                    failure by the sub-processor to fulfil its contractual
                    obligations.
                  </p>
                </li>
                <li>
                  <p>
                    The Processor shall agree a third party beneficiary clause
                    with the sub-processor whereby - in the event the Processor
                    has factually disappeared, ceased to exist in law or has
                    become insolvent - the Controller shall have the right to
                    terminate the sub-processor contract and to instruct the
                    sub-processor to erase or return the personal data.
                  </p>
                </li>
              </ol>
            </li>
            <li>
              <p>International transfers</p>
              <ol>
                <li>
                  <p>
                    Any transfer of data to a third country or an international
                    organisation by the Processor shall be done only on the
                    basis of documented instructions from the Controller or in
                    order to fulfil a specific requirement under Union or Member
                    State law to which the Processor is subject and shall take
                    place in compliance with Chapter V of Regulation (EU)
                    2016/679 or Regulation (EU) 2018/1725.{" "}
                  </p>
                </li>
                <li>
                  <p>
                    The standard contractual clauses adopted by the EU
                    Commission Implementing Decision 2021/914/EU shall apply to
                    any processing activity involving a transfer of personal
                    data within the meaning of Chapter V of Regulation (EU)
                    2016/679.
                  </p>
                </li>
                <li>
                  <p>
                    The Controller agrees that where the Processor engages a
                    sub-processor in accordance with Clause 7.7. for carrying
                    out specific processing activities (on behalf of the
                    controller) and those processing activities involve a
                    transfer of personal data within the meaning of Chapter V of
                    Regulation (EU) 2016/679, the Processor and the
                    sub-processor can ensure compliance with Chapter V of
                    Regulation (EU) 2016/679 by using standard contractual
                    clauses adopted by the Commission in accordance with of
                    Article 46(2) of Regulation (EU) 2016/679, provided the
                    conditions for the use of those standard contractual clauses
                    are met.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
        <li>
          <p>CLAUSE 8</p>
          <p>
            <i>Assistance to the Controller</i>
          </p>
          <ol>
            <li>
              <p>
                The Processor shall promptly notify the Controller of any
                request it has received from the data subject. It shall not
                respond to the request itself, unless authorised to do so by the
                Controller.
              </p>
            </li>
            <li>
              <p>
                The Processor shall assist the Controller in fulfilling its
                obligations to respond to data subjects’ requests to exercise
                their rights, taking into account the nature of the processing.
                In fulfilling its obligations in accordance with (8.1) and
                (8.2), the Processor shall comply with the Controller’s
                instructions
              </p>
            </li>
            <li>
              <p>
                In addition to the Processor’s obligation to assist the
                Controller pursuant to Clause 8.2, the Processor shall
                furthermore assist the Controller in ensuring compliance with
                the following obligations, taking into account the nature of the
                data processing and the information available to the Processor:
              </p>
            </li>
          </ol>
        </li>
      </ol>

      <p className="text-base-300 text-center tracking-widest">4/7</p>
      <hr id="dpa-page-5" className="-mx-10" />
      <ol className="list-custom [counter-set:i_7]">
        <li>
          <ol className="[counter-set:ii_2]">
            <li>
              <ol>
                <li>
                  <p>
                    the obligation to carry out an assessment of the impact of
                    the envisaged processing operations on the protection of
                    personal data (a ‘data protection impact assessment’) where
                    a type of processing is likely to result in a high risk to
                    the rights and freedoms of natural persons
                  </p>
                </li>
                <li>
                  <p>
                    the obligation to consult the competent supervisory
                    authority/ies prior to processing where a data protection
                    impact assessment indicates that the processing would result
                    in a high risk in the absence of measures taken by the
                    Controller to mitigate the risk;
                  </p>
                </li>
                <li>
                  <p>
                    the obligation to ensure that personal data is accurate and
                    up to date, by informing the Controller without delay if the
                    Processor becomes aware that the personal data it is
                    processing is inaccurate or has become outdated;
                  </p>
                </li>
                <li>
                  <p>
                    the obligations in Article 32 of Regulation (EU) 2016/679.
                  </p>
                </li>
              </ol>
            </li>
            <li>
              <p>
                The Parties shall set out in Schedule III the appropriate
                technical and organisational measures by which the Processor is
                required to assist the Controller in the application of this
                Clause as well as the scope and the extent of the assistance
                required.
              </p>
            </li>
          </ol>
        </li>
        <li>
          <p>CLAUSE 9</p>
          <p>
            <i>Notification of personal data breach</i>
          </p>
          <p>
            In the event of a personal data breach, the Processor shall
            cooperate with and assist the Controller for the Controller to
            comply with its obligations under Articles 33 and 34 of Regulation
            (EU) 2016/679 or under Articles 34 and 35 of Regulation (EU)
            2018/1725, where applicable, taking into account the nature of
            processing and the information available to the Processor.
          </p>

          <ol>
            <li>
              <p>Data breach concerning data processed by the Controller</p>
              <p>
                In the event of a personal data breach concerning data processed
                by the Controller, the Processor shall assist the Controller:
              </p>
              <div>
                <ol type="a">
                  <li>
                    <p>
                      in notifying the personal data breach to the competent
                      supervisory authority/ies, without undue delay after the
                      Controller has become aware of it, where relevant/(unless
                      the personal data breach is unlikely to result in a risk
                      to the rights and freedoms of natural persons);
                    </p>
                  </li>
                  <li>
                    <p>
                      in obtaining the following information which, pursuant to
                      Article 33(3) of Regulation (EU) 2016/679, shall be stated
                      in the Controller’s notification, and must at least
                      include:
                    </p>
                    <ol type="i">
                      <li>
                        <p>
                          the nature of the personal data including where
                          possible, the categories and approximate number of
                          data subjects concerned and the categories and
                          approximate number of personal data records concerned;
                        </p>
                      </li>
                      <li>
                        <p>
                          the likely consequences of the personal data breach;
                        </p>
                      </li>
                      <li>
                        <p>
                          the measures taken or proposed to be taken by the
                          Controller to address the personal data breach,
                          including, where appropriate, measures to mitigate its
                          possible adverse effects.
                        </p>
                      </li>
                    </ol>
                    <p>
                      Where, and insofar as, it is not possible to provide all
                      this information at the same time, the initial
                      notification shall contain the information then available
                      and further information shall, as it becomes available,
                      subsequently be provided without undue delay.
                    </p>
                  </li>
                  <li>
                    <p>
                      in complying, pursuant to Article 34 of Regulation (EU)
                      2016/679, with the obligation to communicate without undue
                      delay the personal data breach to the data subject, when
                      the personal data breach is likely to result in a high
                      risk to the rights and freedoms of natural persons.
                    </p>
                  </li>
                </ol>
              </div>
            </li>
          </ol>
        </li>
      </ol>
      <p className="text-base-300 text-center tracking-widest">5/7</p>
      <hr id="dpa-page-6" className="-mx-10" />
      <ol className="list-custom [counter-set:i_8]">
        <li>
          <ol className="[counter-set:ii_1]">
            <li>
              <p>Data breach concerning data processed by the processor </p>
              <ol>
                <li>
                  <p>
                    In the event of a personal data breach concerning data
                    processed by the Processor, the Processor shall notify the
                    Controller without undue delay after the Processor having
                    become aware of the breach. Such notification shall contain,
                    at least:
                  </p>
                  <div>
                    <ol type="a">
                      <li>
                        <p>
                          a description of the nature of the breach (including,
                          where possible, the categories and approximate number
                          of data subjects and data records concerned);
                        </p>
                      </li>
                      <li>
                        <p>
                          the details of a contact point where more information
                          concerning the personal data breach can be obtained;
                        </p>
                      </li>
                      <li>
                        <p>
                          its likely consequences and the measures taken or
                          proposed to be taken to address the breach, including
                          to mitigate its possible adverse effects.
                        </p>
                      </li>
                    </ol>
                  </div>
                  <p>
                    Where, and insofar as, it is not possible to provide all
                    this information at the same time, the initial notification
                    shall contain the information then available and further
                    information shall, as it becomes available, subsequently be
                    provided without undue delay.
                  </p>
                  <p>
                    The Parties shall set out in Schedule III all other elements
                    to be provided by the Processor when assisting the
                    Controller in the compliance with the Controller’s
                    obligations under Articles 33 and 34 of Regulation (EU)
                    2016/679.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
      </ol>

      <h3 id="dpa-section-3">SECTION III – FINAL PROVISIONS</h3>

      <ol className="list-custom [counter-set:i_9]">
        <li>
          <p>CLAUSE 10</p>
          <ol>
            <li>
              <p>Non-compliance with the Clauses and termination</p>
              <ol>
                <li>
                  <p>
                    Without prejudice to any provisions of Regulation (EU)
                    2016/679 and/or Regulation (EU) 2018/1725, in the event that
                    the Processor is in breach of its obligations under these
                    Clauses, the Controller may instruct the Processor to
                    suspend the processing of personal data until the latter
                    complies with these Clauses or the contract is terminated.
                    The Processor shall promptly inform the Controller in case
                    it is unable to comply with these Clauses, for whatever
                    reason.
                  </p>
                </li>
                <li>
                  <p>
                    The Controller shall be entitled to terminate the contract
                    insofar as it concerns processing of personal data in
                    accordance with these Clauses if:
                  </p>
                  <div>
                    <ol type="a">
                      <li>
                        <p>
                          the processing of personal data by the Processor has
                          been suspended by the Controller pursuant to Clause
                          10.1.1 and if compliance with these Clauses is not
                          restored within a reasonable time and in any event
                          within one month following suspension;
                        </p>
                      </li>
                      <li>
                        <p>
                          the Processor is in substantial or persistent breach
                          of these Clauses or its obligations under Regulation
                          (EU) 2016/679 and/or Regulation (EU) 2018/1725;
                        </p>
                      </li>
                      <li>
                        <p>
                          the Processor fails to comply with a binding decision
                          of a competent court or the competent supervisory
                          authority/ies regarding its obligations pursuant to
                          these Clauses or to Regulation (EU) 2016/679 and/or
                          Regulation (EU) 2018/1725.
                        </p>
                      </li>
                    </ol>
                  </div>
                </li>
                <li>
                  <p>
                    The Processor shall be entitled to terminate the contract
                    insofar as it concerns processing of personal data under
                    these Clauses where, after having informed the Controller
                    that its instructions infringe applicable legal requirements
                    in accordance with Clause 7.1.2, the Controller insists on
                    compliance with the instructions.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
      </ol>
      <p className="text-base-300 text-center tracking-widest">6/7</p>
      <hr id="dpa-page-7" className="-mx-10" />
      <ol className="list-custom [counter-set:i_9]">
        <li>
          <ol>
            <li>
              <ol className="[counter-set:iii_3]">
                <li>
                  <p>
                    Following termination of the contract, the Processor shall,
                    at the choice of the Controller, delete all personal data
                    processed on behalf of the Controller and certify to the
                    Controller that it has done so, or, return all the personal
                    data to the Controller and delete existing copies unless
                    Union or Member State law requires storage of the personal
                    data. Until the data is deleted or returned, the Processor
                    shall continue to ensure compliance with these Clauses.
                  </p>
                </li>
              </ol>
            </li>
          </ol>
        </li>
      </ol>

      <p className="text-center">[SIGNATURE PAGE TO FOLLOW]</p>
      <p className="text-base-300 text-center tracking-widest">7/7</p>
      <hr id="dpa-page-schedule-1" className="-mx-10" />

      <p className="text-center">
        Schedule 1<br />
        List of parties
      </p>

      <p className="font-semibold">Controller(s): </p>
      <p>
        Name:{" "}
        {props.authUser?.name || "Host (as defined in the Terms of Hosting)"}
      </p>
      <p>
        Address:{" "}
        {props.authUser?.address ||
          "as provided in the sign-up form on our website."}
      </p>
      <p>
        Contact person’s name:{" "}
        {props.authUser?.name ||
          "as provided in the sign-up form on our website."}
      </p>
      <p>
        Email address:{" "}
        {props.authUser?.email ||
          "as provided in the sign-up form on our website."}
      </p>
      <p>
        Phone Number:{" "}
        {props.authUser?.phone_number ||
          "as provided in the sign-up form on our website."}
      </p>
      <p>&nbsp;</p>
      <p className="font-semibold">Processor(s):</p>
      <p>Name: Clothing Loop</p>
      <p>Address: Hyacintenlaan 25, 2015BA Haarlem </p>
      <p>
        Contact person’s name, postion and contact details:&nbsp;Nichon Glerum
        (founder &amp; CEO)
      </p>
      <p>
        Email address:{" "}
        <a
          href="mailto:hello@clothingloop.org"
          title="mailto:hello@clothingloop.org"
        >
          <u>hello@clothingloop.org</u>
        </a>
      </p>
      <p>Phone Number: +31 6 23497044</p>
      <p>&nbsp;</p>
      <p>
        Contact information of the Host (Name, Address, Email Address, Phone
        Number) is collected.&nbsp; By agreeing to this agreement a host has
        signed this form. Date of signing has been collected and stored.{" "}
      </p>
      <p>&nbsp;</p>
      <p className="text-base-300 text-center tracking-widest">Schedules 1/4</p>
      <hr id="dpa-page-schedule-2" className="-mx-10" />

      <p className="text-center">
        Schedule 2<br />
        Description of the processing
      </p>
      <p>
        <i>
          Categories of data subjects&nbsp; whose personal data is processed
        </i>
      </p>
      <p>Participants of any Loops, organised by Host, and of Host themself</p>
      <p>&nbsp;</p>
      <p>
        <i>Categories of personal data processed</i>
      </p>
      <p>Name, Phone Number, Email Address, Address, Date of Signing up</p>
      <p>&nbsp;</p>
      <p>
        <i>Nature of processing</i>
      </p>
      <p>Hosts are able to organise a Loop</p>
      <p>&nbsp;</p>
      <p>
        <i>
          Purpose(s) for which the personal data is processed on behalf of the
          controller{" "}
        </i>
      </p>
      <p>
        Hosts have the correct and relevant data to facilitate the creation of a
        Loop.{" "}
      </p>
      <p>&nbsp;</p>
      <p>
        <i>Duration of the processing</i>
      </p>
      <p>Until the Loop no longer exists. </p>
      <p className="text-base-300 text-center tracking-widest">Schedules 2/4</p>
      <hr id="dpa-page-schedule-3" className="-mx-10" />

      <p className="text-center">
        Schedule 3<br />
        &nbsp;Technical and organisational measures including technical and
        organisational measures to ensure the security of the data
      </p>
      <p>&nbsp;</p>
      <p>
        <i>Description of the technical and organisational measures imp</i>
        <i>
          lemented by the data importer(s) (including any relevant
          certifications) to ensure an appropriate level of security, taking
          into account the nature, scope, context and purpose of the processing,
          and the risks for the rights and freedoms of natural persons.
        </i>
      </p>
      <p>&nbsp;</p>
      <p>
        <i>[Examples of possible measures:</i>
      </p>
      <p>&nbsp;</p>
      <p>
        <i>Measures of pseudonymisation and encryption of personal data</i>
      </p>
      <p>
        The measures taken are the: login credentials, strict authentication
        rules for data access and roles distribution (between Hosts, Participant
        and Super Admin). Furthermore, a delivering of an SSL certificate to
        encrypt traffic between the browser and the server.
      </p>
      <p>&nbsp;</p>
      <p>
        <i>
          Measures for ensuring ongoing confidentiality, integrity, availability
          and resilience of processing systems and services
        </i>
      </p>
      <p>
        Controller uses githubs&nbsp;dependa-bot to keep up to date with the
        latest security vulnerabilities. Additionally, caddy obtains and renews
        TLS certificates for your sites automatically. This ensures ongoing
        confidentiality, integrity, availability and resilience of processing
        systems and services
      </p>
      <p>&nbsp;</p>
      <p>
        <i>
          Measures for ensuring the ability to restore the availability and
          access to personal data in a timely manner in the event of a physical
          or technical incident
        </i>
      </p>
      <p>
        Controller makes a backup in a timely manner with all data in a secure
        location only accessible to the Controller.
      </p>
      <p>&nbsp;</p>
      <p>
        <i>
          Processes for regularly testing, assessing and evaluating the
          effectiveness of technical and organisational measures in order to
          ensure the security of the processing
        </i>
      </p>
      <p>
        Automated tests are run before updating the Web Application. The
        Controller is required to test any changes by hand as well.{" "}
      </p>
      <p>&nbsp;</p>
      <p>
        <i>Measures for user identification and authorisation</i>
      </p>
      <p>
        An email is sent by the Controller to verify accounts, before allowing
        access.
      </p>
      <p>&nbsp;</p>
      <p>
        <i>Measures for the protection of data during transmission</i>
      </p>
      <p>
        the Controller uses Caddy, which obtains and renews TLS certificates
        automatically, this ensures that the data is encrypted in transit.
      </p>
      <p>&nbsp;</p>
      <p>
        <i>Measures for the protection of data during storage</i>
      </p>
      <p>
        The database is inaccessible to any other service other than the server.
        The Processor has limited access to the database, only the Controller
        has full access to the database.{" "}
      </p>
      <p>&nbsp;</p>
      <p>
        <i>
          Measures for ensuring physical security of locations at which personal
          data are processed
        </i>
      </p>
      <p>
        Controller uses Webdock, Webdock will notify Controller if data has been
        breached by physical access.
      </p>
      <p>&nbsp;</p>
      <p>
        <i>Measures for ensuring events logging</i>
      </p>
      <p>
        The Web Application logs events for debugging purposes by Controller.
      </p>
      <p>&nbsp;</p>
      <p>
        <i>
          Measures for ensuring system configuration, including default
          configuration
        </i>
      </p>
      <p>
        Controller use ansible scripts to ensure that certain server os &amp;
        application level configurations are maintained.
      </p>
      <p>&nbsp;</p>
      <p>
        <i>
          Measures for internal IT and IT security governance and management
        </i>
      </p>
      <p>
        Controller protects access keys. Access keys are given on a need to use
        basis. Access keys are granted only if a Data Protection Agreement is
        signed.{" "}
      </p>
      <p className="text-base-300 text-center tracking-widest">Schedules 3/4</p>
      <hr id="dpa-page-schedule-4" className="-mx-10" />

      <p>
        <i>Measures for ensuring data quality</i>
      </p>
      <p>
        The Web Application has strict validation requirements for correct data
        to ensure data quality.
      </p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>
        <i>Measures for ensuring limited data retention</i>
      </p>
      <p>
        Loops that are inactive will after a certain period of time be deleted,
        the Processors are notified beforehand.
      </p>
      <p>&nbsp;</p>
      <p>
        <i>Measures for ensuring accountability</i>
      </p>
      <p>
        The general Terms of Use and Terms of Hosts hosts are signed by the
        corresponding parties. These documents ensure accountability.{" "}
      </p>
      <p>&nbsp;</p>
      <p>
        <i>Measures for allowing data portability and ensuring erasure]</i>
      </p>
      <p>
        The Controller is responsible for deleting user’s data on the website
        and database. Erasure of data is provided by the “delete account” button
        on the website for a user.{" "}
      </p>
      <p>
        The Processor is able to export data to organise a Loop. An export
        button on the Website enables Processors to download information of a
        Loop, in CSV format, ensuring Data portability. The Processor is
        responsible for managing the data in a secure manner. After a user is no
        longer&nbsp; part of a Loop, the Processor and Controller is responsible
        for deleting all user’s data in their possession.{" "}
      </p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <p>
        <i>
          For transfers to (sub-) processors, also describe the specific
          technical and organisational measures to be taken by the (sub-)
          processor to be able to provide assistance to the controller{" "}
        </i>
      </p>
      <p>
        Processors need to have a working and secure email address to be able to
        get transfers from the Controller. This email address is also to be used
        for communication between the Processor and the Controller.{" "}
      </p>
      <p>&nbsp;</p>
      <p>
        <i>
          Description of the specific technical and organizational measures to
          be taken by the processor to be able to provide assistance to the
          controller.
        </i>
      </p>
      <p>
        Processors need to be able to reply to emails from the Controller.
        <br />
        &nbsp;
      </p>
      <p className="text-base-300 text-center tracking-widest">Schedules 4/4</p>
    </div>
  );
}
